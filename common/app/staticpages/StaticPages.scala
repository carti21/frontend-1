package staticpages

import model.{DotcomContentType, MetaData, SectionId, SimplePage, StandalonePage}
import services.newsletters.{GroupedNewslettersResponse, NewsletterResponse}

case class NewsletterRoundupPage(
    metadata: MetaData,
    groupedNewsletterResponses: List[(String, List[NewsletterResponse])],
) extends StandalonePage {
  val groupedNewslettersResponses = groupedNewsletterResponses
}

object StaticPages {
  def simpleSurveyStaticPageForId(id: String): SimplePage =
    SimplePage(
      MetaData.make(
        id = id,
        section = Option(SectionId(value = "global")),
        webTitle = "Guardian Survey Page",
        contentType = Some(DotcomContentType.Survey),
        iosType = None,
        shouldGoogleIndex = false,
      ),
    )

  def simpleEmailSignupPage(id: String, webTitle: String): SimplePage =
    SimplePage(
      MetaData.make(
        id = id,
        section = Option(SectionId(value = "email-signup-page")),
        webTitle = webTitle,
        contentType = Some(DotcomContentType.Signup),
        iosType = None,
        shouldGoogleIndex = false,
      ),
    )

  def simpleNewslettersPage(
      id: String,
      groupedNewsletterResponses: List[(String, List[NewsletterResponse])],
  ): NewsletterRoundupPage =
    NewsletterRoundupPage(
      MetaData.make(
        id = id,
        section = Option(SectionId(value = "newsletter-signup-page")),
        webTitle = "Guardian newsletters: sign up",
        contentType = Some(DotcomContentType.Signup),
        iosType = None,
        shouldGoogleIndex = true,
      ),
      groupedNewsletterResponses,
    )
}
