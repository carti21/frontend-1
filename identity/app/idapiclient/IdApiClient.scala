package idapiclient

import com.gu.identity.model.{EmailList, Subscriber, User}

import scala.concurrent.{ExecutionContext, Future}
import idapiclient.responses.{AccountDeletionResult, CookiesResponse, Error, HttpResponse}
import conf.IdConfig
import idapiclient.parser.IdApiJsonBodyParser
import net.liftweb.json.JsonDSL._
import net.liftweb.json.compactRender
import net.liftweb.json.JsonAST.JObject
import net.liftweb.json.Serialization.write
import utils.SafeLogging
import idapiclient.requests.{AutoSignInToken, DeletionBody, PasswordUpdate, TokenPassword}
import org.slf4j.LoggerFactory
import play.api.libs.ws.WSClient

class IdApiClient(idJsonBodyParser: IdApiJsonBodyParser, conf: IdConfig, httpClient: HttpClient)(implicit
    val executionContext: ExecutionContext,
) extends SafeLogging {

  private val apiRootUrl: String = conf.apiRoot
  private val clientAuth: Auth = ClientAuth(conf.apiClientToken)
  private val exactTargetLogger = LoggerFactory.getLogger("exactTarget")

  import idJsonBodyParser.{extractUnit, extract, jsonField}

  private implicit val formats = idJsonBodyParser.formats

  private def extractUser: (Response[HttpResponse]) => Response[User] = extract(jsonField("user"))

  //   AUTH
  def authBrowser(
      userAuth: Auth,
      trackingData: TrackingData,
      persistent: Option[Boolean] = None,
  ): Future[Response[CookiesResponse]] = {
    val params =
      buildParams(None, Some(trackingData), Seq("format" -> "cookies") ++ persistent.map("persistent" -> _.toString))
    val headers = buildHeaders(Some(userAuth), extra = xForwardedForHeader(trackingData))
    val body = write(userAuth)
    val response = httpClient.POST(apiUrl("auth"), Some(body), params, headers)
    response map extract(jsonField("cookies"))
  }

  def unauth(auth: Auth, trackingData: TrackingData): Future[Response[CookiesResponse]] =
    post("unauth", Some(auth), Some(trackingData)) map extract[CookiesResponse](jsonField("cookies"))

  //  AUTO SIGN IN TOKENS
  def verifyAutoSignInToken(token: String): Future[Response[CookiesResponse]] = {
    val response = httpClient.PUT(
      apiUrl("auto-signin-token"),
      Some(write(AutoSignInToken(token))),
      clientAuth.parameters,
      clientAuth.headers,
    )
    response map extract(jsonField("cookies"))
  }

  // USERS

  def user(userId: String, auth: Auth = Anonymous): Future[Response[User]] = {
    val apiPath = urlJoin("user", userId)
    val params = buildParams(Some(auth))
    val headers = buildHeaders(Some(auth))
    val response = httpClient.GET(apiUrl(apiPath), None, params, headers)
    response map extractUser
  }

  def userFromQueryParam(param: String, field: String, auth: Auth = Anonymous): Future[Response[User]] = {
    val apiPath = s"/user?${field}=${param}"
    val params = buildParams(Some(auth))
    val headers = buildHeaders(Some(auth))
    val response = httpClient.GET(apiUrl(apiPath), None, params, headers)
    response map extractUser
  }

  def saveUser(userId: String, user: UserUpdateDTO, auth: Auth): Future[Response[User]] =
    post(urlJoin("user", userId), Some(auth), body = Some(write(user))) map extractUser

  def me(auth: Auth): Future[Response[User]] = {
    val apiPath = urlJoin("user", "me")
    val params = buildParams(Some(auth))
    val response = httpClient.GET(apiUrl(apiPath), None, params, buildHeaders(Some(auth)))
    response map extractUser
  }

  // PASSWORD RESET/UPDATE

  def passwordExists(auth: Auth, trackingData: TrackingData): Future[Response[Boolean]] = {
    val apiPath = urlJoin("user", "password-exists")
    val headers = buildHeaders(Some(auth), extra = xForwardedForHeader(trackingData))
    val response = httpClient.GET(apiUrl(apiPath), None, buildParams(Some(auth)), headers)
    response map extract[Boolean](jsonField("passwordExists"))
  }

  def updatePassword(
      pwdUpdate: PasswordUpdate,
      auth: Auth,
      trackingData: TrackingData,
  ): Future[Response[CookiesResponse]] = {
    val apiPath = urlJoin("user", "password")
    val body = write(pwdUpdate)
    val headers = buildHeaders(Some(auth), extra = xForwardedForHeader(trackingData))
    val response = httpClient.POST(apiUrl(apiPath), Some(body), clientAuth.parameters, headers)
    response map extract[CookiesResponse](jsonField("cookies"))
  }

  def userForToken(token: String): Future[Response[User]] = {
    val apiPath = urlJoin("pwd-reset", "user-for-token")
    val params = buildParams(extra = Iterable("token" -> token))
    val response = httpClient.GET(apiUrl(apiPath), None, params, buildHeaders())
    response map extractUser
  }

  def resetPassword(
      token: String,
      newPassword: String,
      trackingData: TrackingData,
  ): Future[Response[CookiesResponse]] = {
    val apiPath = urlJoin("pwd-reset", "reset-pwd-for-user")
    val postBody = write(TokenPassword(token, newPassword))
    val headers = clientAuth.headers ++ buildHeaders(extra = xForwardedForHeader(trackingData))
    val response = httpClient.POST(apiUrl(apiPath), Some(postBody), clientAuth.parameters, headers)
    response map extract(jsonField("cookies"))
  }

  // EMAILS

  def userEmails(userId: String, trackingParameters: TrackingData): Future[Response[Subscriber]] = {
    val apiPath = urlJoin("useremails", userId)
    val params = buildParams(tracking = Some(trackingParameters))
    val response =
      httpClient.GET(apiUrl(apiPath), None, params, buildHeaders(extra = xForwardedForHeader(trackingParameters)))
    response map extract(jsonField("result"))
  }

  def addSubscription(
      userId: String,
      emailList: EmailList,
      auth: Auth,
      trackingParameters: TrackingData,
  ): Future[Response[Unit]] = {
    exactTargetLogger.debug(s"Subscribing $userId to listId: ${emailList.listId}")
    post(
      urlJoin("useremails", userId, "subscriptions"),
      Some(auth),
      Some(trackingParameters),
      Some(write(emailList)),
    ) map extractUnit
  }

  def deleteSubscription(
      userId: String,
      emailList: EmailList,
      auth: Auth,
      trackingParameters: TrackingData,
  ): Future[Response[Unit]] = {
    exactTargetLogger.debug(s"Unsubscribing $userId to listId: ${emailList.listId}")
    delete(
      urlJoin("useremails", userId, "subscriptions"),
      Some(auth),
      Some(trackingParameters),
      Some(write(emailList)),
    ) map extractUnit
  }

  def setPasswordGuest(password: String, token: String): Future[Response[CookiesResponse]] = {
    val body: JObject = "password" -> password
    put(
      "guest/password",
      None,
      None,
      Some(compactRender(body)),
      List(
        "X-Guest-Registration-Token" -> token,
        "Content-Type" -> "application/json",
        "X-GU-ID-Client-Access-Token" -> conf.apiClientToken,
      ),
      List("validate-email" -> "0"),
    ).map(extract(jsonField("cookies")))
  }

  def deleteTelephone(auth: Auth): Future[Response[Unit]] =
    delete("user/me/telephoneNumber", Some(auth)) map extractUnit

  // THIRD PARTY SIGN-IN
  def executeAccountDeletionStepFunction(
      userId: String,
      email: String,
      reason: Option[String],
      auth: Auth,
  ): Future[Response[AccountDeletionResult]] = {
    httpClient.POST(
      s"${conf.accountDeletionApiRoot}/delete",
      Some(write(DeletionBody(userId, email, reason))),
      urlParameters = Nil,
      headers = buildHeaders(Some(auth), extra = Seq(("x-api-key", conf.accountDeletionApiKey))),
    ) map extract[AccountDeletionResult](identity)
  }

  // EMAIL TOKENS
  def decryptEmailToken(token: String): Future[Response[String]] = {
    val apiPath = urlJoin("signin-token", "token", token)
    val response = httpClient.GET(uri = apiUrl(apiPath), None, None, buildHeaders())
    response map extract(jsonField("email"))
  }

  def resendEmailValidationEmailByToken(token: String, returnUrl: Option[String]): Future[Response[Unit]] = {
    val apiPath = urlJoin("signin-token", "send-validation-email", token)
    val parameters = returnUrl.map(url => Iterable("returnUrl" -> url)).getOrElse(Iterable.empty)
    val response = httpClient.POST(uri = apiUrl(apiPath), None, None, buildHeaders(extra = parameters))
    response map extractUnit
  }

  def put(
      apiPath: String,
      auth: Option[Auth] = None,
      trackingParameters: Option[TrackingData] = None,
      body: Option[String] = None,
      extraHeaders: Parameters,
      urlParameters: Parameters,
  ): Future[Response[HttpResponse]] =
    httpClient.PUT(
      apiUrl(apiPath),
      body,
      buildParams(auth, trackingParameters) ++ urlParameters,
      buildHeaders(auth) ++ extraHeaders,
    )

  def post(
      apiPath: String,
      auth: Option[Auth] = None,
      trackingParameters: Option[TrackingData] = None,
      body: Option[String] = None,
  ): Future[Response[HttpResponse]] = {
    httpClient.POST(
      apiUrl(apiPath),
      body,
      buildParams(auth, trackingParameters),
      buildHeaders(auth, trackingParameters.map(xForwardedForHeader)),
    )
  }

  def delete(
      apiPath: String,
      auth: Option[Auth] = None,
      trackingParameters: Option[TrackingData] = None,
      body: Option[String] = None,
  ): Future[Response[HttpResponse]] =
    httpClient.DELETE(apiUrl(apiPath), body, buildParams(auth, trackingParameters), buildHeaders(auth))

  implicit object ParamsOpt2Params extends (Option[Parameters] => Parameters) {
    def apply(paramsOpt: Option[Parameters]): Parameters = paramsOpt.getOrElse(Iterable.empty)
  }

  private def buildParams(
      auth: Option[Auth] = None,
      tracking: Option[TrackingData] = None,
      extra: Parameters = Iterable.empty,
  ): Parameters =
    extra ++ clientAuth.parameters ++ auth.map(_.parameters) ++ tracking.map(_.parameters)

  private def buildHeaders(auth: Option[Auth] = None, extra: Parameters = Iterable.empty): Parameters = {
    extra ++ clientAuth.headers ++ auth.map(_.headers)
  }

  private def apiUrl(path: String) = urlJoin(apiRootUrl, path)

  private def urlJoin(pathParts: String*) = {
    pathParts
      .filter(_.nonEmpty)
      .map(slug => {
        slug.stripPrefix("/").stripSuffix("/")
      }) mkString "/"
  }

  private def xForwardedForHeader(trackingParameters: TrackingData): Parameters =
    trackingParameters.ipAddress
      .map(ip => Iterable("X-Forwarded-For" -> ip))
      .getOrElse(Iterable.empty)
}

class HttpClient(wsClient: WSClient)(implicit val executionContext: ExecutionContext) extends SafeLogging {

  def GET(
      uri: String,
      body: Option[String] = None,
      urlParameters: Parameters,
      headers: Parameters,
  ): Future[Response[HttpResponse]] = {
    makeRequest("GET", uri, body, urlParameters, headers)
  }

  def POST(
      uri: String,
      body: Option[String],
      urlParameters: Parameters,
      headers: Parameters,
  ): Future[Response[HttpResponse]] = {
    makeRequest("POST", uri, body, urlParameters, headers)
  }

  def DELETE(
      uri: String,
      body: Option[String],
      urlParameters: Parameters = Nil,
      headers: Parameters,
  ): Future[Response[HttpResponse]] = {
    makeRequest("DELETE", uri, body, urlParameters, headers)
  }

  def PUT(
      uri: String,
      body: Option[String],
      urlParameters: Parameters = Nil,
      headers: Parameters,
  ): Future[Response[HttpResponse]] =
    makeRequest("PUT", uri, body, urlParameters, headers)

  def makeRequest(
      method: String,
      uri: String,
      body: Option[String],
      urlParameters: Parameters = Nil,
      headers: Parameters,
  ): Future[Response[HttpResponse]] = {

    wsClient
      .url(uri)
      .withBody(body.getOrElse("")) // FIXME: DELETE should not have a body
      .withQueryStringParameters(urlParameters.toList: _*)
      .withHttpHeaders(headers.toList: _*)
      .withMethod(method)
      .execute()
      .map { resp => Right(HttpResponse(resp.body, resp.status, resp.statusText)) }
      .recover {
        case e: Throwable =>
          logger.error(s"Network error while communicating with $uri:", e)
          Left(List(Error(e.getClass.getName, e.toString)))
      }
  }
}
