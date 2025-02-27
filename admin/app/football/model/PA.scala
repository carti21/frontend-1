package football.model

import pa.{Season, Team}
import implicits.Collections
import org.joda.time.DateTime

import java.time.ZoneId

object PA extends Collections {

  val competitionNames = Map[String, String](
    ("100", "Premier League"),
    ("101", "Championship"),
    ("102", "League One"),
    ("103", "League Two"),
    ("120", "Scottish Premiership"),
    ("121", "Scottish Championship"),
    ("122", "Scottish League One"),
    ("123", "Scottish League Two"),
    ("300", "FA Cup"),
    ("320", "Scottish Cup"),
    ("301", "Carabao Cup"),
    ("400", "Community Shield"),
    ("500", "Champions League"),
    ("510", "Europa League"),
    ("620", "Ligue 1"),
    ("625", "Bundesliga"),
    ("635", "Serie A"),
    ("650", "La Liga"),
    ("700", "World Cup"),
    ("721", "International friendlies"),
    ("870", "Women's World Cup"),
    ("961", "Women's Super League"),
  )
  def competitionName(season: Season): String = competitionNames.getOrElse(season.id, season.name)

  val approvedCompetitions = List(
    "100",
    "500",
    "510",
    "300",
    "301",
    "101",
    "102",
    "103",
    "400",
    "120",
    "121",
    "122",
    "123",
    "320",
    "321",
    "700",
    "721",
    "750",
    "650",
    "620",
    "625",
    "635",
    "870",
    "961",
  )

  def filterCompetitions(competitions: List[Season]): List[Season] = {
    competitions
      .filter(comp => approvedCompetitions.contains(comp.competitionId))
      .sortBy(_.startDate.atStartOfDay().atZone(ZoneId.of("Europe/London")).toInstant.toEpochMilli)
      .reverse
      .distinctBy(_.competitionId)
      .sortBy(_.competitionId)
  }

  object teams {

    val all = List(
      Team("38298", "AC Ajaccio"),
      Team("26368", "AC Milan"),
      Team("51830", "AFC Hornchurch"),
      Team("45987", "AFC Wimbledon"),
      Team("41224", "AS Trencin"),
      Team("26464", "AZ"),
      Team("26415", "AaB"),
      Team("93", "Aberdeen"),
      Team("1204", "Accrington Stanley"),
      Team("38606", "Airbus UK"),
      Team("45938", "Airdrieonians"),
      Team("26320", "Ajax"),
      Team("63031", "Ajax/SV Red Bull Salzburg"),
      Team("45585", "Aktobe"),
      Team("5536", "Albania"),
      Team("103", "Albion"),
      Team("6886", "Aldershot"),
      Team("1205", "Alfreton Town"),
      Team("104", "Alloa"),
      Team("41189", "Almeria"),
      Team("133", "Altrincham"),
      Team("26291", "Anderlecht"),
      Team("8230", "Andorra"),
      Team("17635", "Annan Athletic"),
      Team("6952", "Anorthosis Famagusta"),
      Team("42007", "Anzhi Makhachkala"),
      Team("63020", "Anzhi Makhachkala/Genk"),
      Team("32703", "Apoel Nicosia"),
      Team("38343", "Apollon Limassol"),
      Team("116", "Arbroath"),
      Team("965", "Argentina"),
      Team("6604", "Armenia"),
      Team("1006", "Arsenal"),
      Team("58671", "Astana"),
      Team("54346", "Asteras Tripoli"),
      Team("2", "Aston Villa"),
      Team("26364", "Atalanta"),
      Team("26313", "Athletic Bilbao"),
      Team("26305", "Atletico Madrid"),
      Team("63838", "Atlético Madrid Women"),
      Team("48179", "Atromitos"),
      Team("13022", "Auchinleck Talbot"),
      Team("32656", "Augsburg"),
      Team("7317", "Australia"),
      Team("992", "Austria"),
      Team("105", "Ayr"),
      Team("6602", "Azerbaijan"),
      Team("38272", "BATE"),
      Team("26453", "BK Hacken"),
      Team("40423", "Bala Town"),
      Team("26300", "Barcelona"),
      Team("62804", "Barcelona Women"),
      Team("134", "Barnet"),
      Team("21", "Barnsley"),
      Team("6889", "Basingstoke"),
      Team("26398", "Basle"),
      Team("26341", "Bastia"),
      Team("7808", "Bath City"),
      Team("26256", "Bayer Leverkusen"),
      Team("26247", "Bayern Munich"),
      Team("64498", "Bayern Munich Women"),
      Team("6262", "Belarus"),
      Team("997", "Belgium"),
      Team("26274", "Benfica"),
      Team("43255", "Beroe"),
      Team("117", "Berwick"),
      Team("26446", "Besiktas"),
      Team("11544", "Biggleswade Town"),
      Team("7066", "Billericay"),
      Team("38267", "Birkirkara"),
      Team("45", "Birmingham"),
      Team("6245", "Bishop's Stortford"),
      Team("22", "Blackburn"),
      Team("46", "Blackpool"),
      Team("6306", "Bolivia"),
      Team("26371", "Bologna"),
      Team("47", "Bolton"),
      Team("12843", "Boness"),
      Team("46472", "Boness Utd"),
      Team("26340", "Bordeaux"),
      Team("19307", "Boreham Wood"),
      Team("26261", "Borussia Dortmund"),
      Team("26259", "Borussia M'gladbach"),
      Team("7531", "Bosnia-Herzegovina"),
      Team("136", "Boston Utd"),
      Team("45603", "Botev Plovdiv"),
      Team("23", "Bournemouth"),
      Team("10189", "Brackley"),
      Team("24", "Bradford"),
      Team("13730", "Bradford P A"),
      Team("26269", "Braga"),
      Team("9262", "Braintree Town"),
      Team("23104", "Brazil"),
      Team("118", "Brechin"),
      Team("38325", "Breidablik"),
      Team("48", "Brentford"),
      Team("6795", "Brighton"),
      Team("49", "Bristol City"),
      Team("50", "Bristol Rovers"),
      Team("160", "Bromley"),
      Team("7598", "Brora"),
      Team("6580", "Buckie Thistle"),
      Team("38316", "Budapest Honved"),
      Team("980", "Bulgaria"),
      Team("70", "Burnley"),
      Team("6574", "Burntisland Shipyard"),
      Team("26450", "Bursaspor"),
      Team("184", "Burton Albion"),
      Team("51", "Bury"),
      Team("42974", "CM Celje"),
      Team("57488", "CS Fola Esch"),
      Team("27018", "CSKA Moscow"),
      Team("26474", "Cagliari"),
      Team("71", "Cambridge Utd"),
      Team("7924", "Cameroon"),
      Team("31901", "Canada"),
      Team("52", "Cardiff"),
      Team("72", "Carlisle"),
      Team("27788", "Catania"),
      Team("54788", "Celik"),
      Team("26302", "Celta Vigo"),
      Team("94", "Celtic"),
      Team("3", "Charlton"),
      Team("186", "Chelmsford"),
      Team("4", "Chelsea"),
      Team("137", "Cheltenham"),
      Team("53", "Chester FC"),
      Team("73", "Chesterfield"),
      Team("40398", "Chicago Fire"),
      Team("27611", "Chievo"),
      Team("53735", "Chikhura Sachkhere"),
      Team("2559", "Chile"),
      Team("37335", "China PR"),
      Team("50945", "Chivas USA"),
      Team("27882", "Chornomorets"),
      Team("63024", "Chornomorets/Lyon"),
      Team("23340", "Civil Service Strollers"),
      Team("7800", "Clachnacuddin"),
      Team("318", "Cliftonville"),
      Team("26282", "Club Brugge"),
      Team("106", "Clyde"),
      Team("74", "Colchester"),
      Team("23337", "Coldstream"),
      Team("6996", "Colombia"),
      Team("40392", "Colorado Rapids"),
      Team("38346", "Columbus Crew"),
      Team("884", "Colwyn Bay"),
      Team("10197", "Corby"),
      Team("37621", "Costa Rica"),
      Team("7798", "Cove Rangers"),
      Team("6", "Coventry"),
      Team("119", "Cowdenbeath"),
      Team("188", "Crawley Town"),
      Team("54", "Crewe"),
      Team("2489", "Croatia"),
      Team("319", "Crusaders"),
      Team("28015", "Crvena Zvezda"),
      Team("5", "Crystal Palace"),
      Team("16367", "Culter"),
      Team("5628", "Cyprus"),
      Team("6318", "Czech Republic"),
      Team("38345", "DC United"),
      Team("179", "Dag & Red"),
      Team("16365", "Dalbeattie Star"),
      Team("10208", "Dartford"),
      Team("13776", "Daventry Town"),
      Team("38312", "Debrecen"),
      Team("986", "Denmark"),
      Team("7", "Derby"),
      Team("1570", "Derry City"),
      Team("7140", "Deveronvale"),
      Team("46004", "Dila Gori"),
      Team("8254", "Dinamo Minsk"),
      Team("7758", "Dinamo Tbilisi"),
      Team("32166", "Dinamo Zagreb"),
      Team("38305", "Dnipro"),
      Team("63028", "Dnipro/Spurs"),
      Team("43561", "Domzale"),
      Team("6794", "Doncaster"),
      Team("190", "Dorchester"),
      Team("191", "Dover"),
      Team("2287", "Drogheda Utd"),
      Team("18860", "Droylsden"),
      Team("120", "Dumbarton"),
      Team("95", "Dundee"),
      Team("96", "Dundee Utd"),
      Team("97", "Dunfermline"),
      Team("7012", "Dynamo Kyiv"),
      Team("58519", "Dynamo Kyiv/Valencia"),
      Team("43015", "EB Streymur"),
      Team("121", "East Fife"),
      Team("122", "East Stirling"),
      Team("13754", "Eastbourne Borough"),
      Team("10894", "Eastleigh"),
      Team("37262", "Ecuador"),
      Team("23418", "Edinburgh City"),
      Team("23336", "Edinburgh Univ"),
      Team("45562", "Eintracht Braunschweig"),
      Team("26460", "Eintracht Frankfurt"),
      Team("37488", "Elche"),
      Team("7558", "Elgin"),
      Team("497", "England"),
      Team("37280", "Equatorial Guinea"),
      Team("35563", "Esbjerg"),
      Team("63033", "Esbjerg/Fiorentina"),
      Team("26306", "Espanyol"),
      Team("5603", "Estonia"),
      Team("27811", "Estoril"),
      Team("8", "Everton"),
      Team("59842", "Evian TG"),
      Team("76", "Exeter"),
      Team("38274", "F91 Dudelange"),
      Team("53661", "FC 03 Differdange"),
      Team("58950", "FC Astra Giurgiu"),
      Team("26412", "FC Copenhagen"),
      Team("45978", "FC Dacia"),
      Team("40399", "FC Dallas"),
      Team("49167", "FC Daugava"),
      Team("79", "FC Halifax"),
      Team("53068", "FC Honka"),
      Team("58719", "FC Kruoja"),
      Team("38302", "FC Metalist Kharkiv"),
      Team("38380", "FC Mika"),
      Team("58978", "FC Milsami"),
      Team("43136", "FC Nordsjaelland"),
      Team("57723", "FC Pasching"),
      Team("26264", "FC Porto"),
      Team("63022", "FC Porto/Eintracht Frankfurt"),
      Team("38383", "FC Sheriff"),
      Team("45730", "FC Thun"),
      Team("38389", "FC Tiraspol"),
      Team("26334", "FC Utrecht"),
      Team("38394", "FC Vaduz"),
      Team("26394", "FC Zurich"),
      Team("43028", "FH Hafnarfjordur"),
      Team("26402", "FK Austria Vienna"),
      Team("38392", "FK Ekranas"),
      Team("57487", "FK Jagodina"),
      Team("43545", "FK Karabakh"),
      Team("61822", "FK Kukesi"),
      Team("58957", "FK Qarabag"),
      Team("43372", "FK Sarajevo"),
      Team("36571", "FK Senica"),
      Team("45186", "FK Suduva"),
      Team("48576", "FK Turnovo"),
      Team("38376", "FK Ventspils"),
      Team("6603", "FYR Macedonia"),
      Team("108", "Falkirk"),
      Team("11667", "Farnborough"),
      Team("1677", "Faroe Islands"),
      Team("26449", "Fenerbahce"),
      Team("26323", "Feyenoord"),
      Team("991", "Finland"),
      Team("26366", "Fiorentina"),
      Team("43080", "Fiorita"),
      Team("11899", "Fleetwood Town"),
      Team("41279", "Flora Tallinn"),
      Team("5945", "Forest Green"),
      Team("109", "Forfar"),
      Team("7797", "Forres Mechanics"),
      Team("7799", "Fort William"),
      Team("619", "France"),
      Team("1463", "Fraserburgh"),
      Team("55", "Fulham"),
      Team("208", "Gainsborough"),
      Team("23326", "Gala Fairydean"),
      Team("26451", "Galatasaray"),
      Team("53145", "Gandzasar Kapan"),
      Team("209", "Gateshead"),
      Team("41409", "Gefle IF"),
      Team("26284", "Genk"),
      Team("6894", "Genoa"),
      Team("6527", "Georgia"),
      Team("1678", "Germany"),
      Team("37459", "Getafe"),
      Team("37306", "Ghana"),
      Team("6740", "Gibraltar"),
      Team("77", "Gillingham"),
      Team("12997", "Girvan"),
      Team("46073", "Glasgow City FC"),
      Team("7137", "Glasgow Univ"),
      Team("308", "Glentoran"),
      Team("35475", "Gloucester"),
      Team("36345", "Golspie Sutherland"),
      Team("41000", "Granada"),
      Team("26388", "Grasshoppers"),
      Team("6286", "Greece"),
      Team("78", "Grimsby"),
      Team("37620", "Guatemala"),
      Team("26265", "Guimaraes"),
      Team("26347", "Guingamp"),
      Team("18890", "Guiseley"),
      Team("38313", "Gyor"),
      Team("38239", "HB Torshavn"),
      Team("6824", "HJK Helsinki"),
      Team("37619", "Haiti"),
      Team("6546", "Hajduk Split"),
      Team("26254", "Hamburg"),
      Team("110", "Hamilton"),
      Team("32309", "Hannover 96"),
      Team("48302", "Hapoel Ramat Gan"),
      Team("35999", "Hapoel Tel-Aviv"),
      Team("13732", "Harrogate Town"),
      Team("80", "Hartlepool"),
      Team("23510", "Havant and W"),
      Team("23419", "Hawick Royal Albert"),
      Team("55986", "Hayes & Yeading"),
      Team("98", "Hearts"),
      Team("647", "Hednesford"),
      Team("81", "Hereford"),
      Team("26263", "Hertha Berlin"),
      Team("99", "Hibernian"),
      Team("42973", "Hibernians"),
      Team("10186", "Hinckley Utd"),
      Team("19786", "Histon"),
      Team("41575", "Hodd"),
      Team("631", "Holland"),
      Team("37618", "Honduras"),
      Team("40395", "Houston Dynamo"),
      Team("56", "Huddersfield"),
      Team("26", "Hull"),
      Team("493", "Hungary"),
      Team("6579", "Huntly"),
      Team("212", "Hyde"),
      Team("38323", "IBV Vestmannaeyjar"),
      Team("26235", "IF Elfsborg"),
      Team("49284", "IF Fuglafjordur"),
      Team("7806", "IFK Goteborg"),
      Team("50958", "IFK Mariehamn"),
      Team("2340", "Iceland"),
      Team("37336", "Indonesia"),
      Team("43543", "Inter Baku"),
      Team("6136", "Inter Milan"),
      Team("26494", "Inter Turku"),
      Team("1456", "Inverness CT"),
      Team("12941", "Inverurie Loco Works"),
      Team("27", "Ipswich"),
      Team("37323", "Iraq"),
      Team("45583", "Irtysh"),
      Team("13028", "Irvine Meadow"),
      Team("6600", "Israel"),
      Team("717", "Italy"),
      Team("37285", "Ivory Coast"),
      Team("38333", "Jablonec"),
      Team("8068", "Jamaica"),
      Team("6736", "Japan"),
      Team("38377", "Jeunesse Esch"),
      Team("26359", "Juventus"),
      Team("63032", "Juventus/Trabzonspor"),
      Team("7009", "KR Reykjavik"),
      Team("38367", "KS Teuta"),
      Team("37324", "Kazakhstan"),
      Team("6578", "Keith"),
      Team("47840", "Khazar Lenkoran"),
      Team("155", "Kidderminster"),
      Team("123", "Kilmarnock"),
      Team("49100", "Kuban Krasnodar"),
      Team("7529", "Kuwait"),
      Team("37319", "Kyrgyzstan"),
      Team("40394", "L.A Galaxy"),
      Team("49758", "Laci"),
      Team("5602", "Latvia"),
      Team("26362", "Lazio"),
      Team("63021", "Lazio/Ludogorets"),
      Team("32816", "Lech Poznan"),
      Team("28", "Leeds"),
      Team("36570", "Legia Warsaw"),
      Team("29", "Leicester"),
      Team("37271", "Lesotho"),
      Team("43008", "Levadia Tallinn"),
      Team("37454", "Levante"),
      Team("32317", "Levski Sofia"),
      Team("57", "Leyton Orient"),
      Team("38329", "Liberec"),
      Team("63019", "Liberec/AZ"),
      Team("43074", "Libertas"),
      Team("6259", "Liechtenstein"),
      Team("27372", "Lille"),
      Team("82", "Lincoln City"),
      Team("310", "Linfield"),
      Team("5527", "Lithuania"),
      Team("9", "Liverpool"),
      Team("111", "Livingston"),
      Team("41783", "Livorno"),
      Team("58964", "Lokomotiva Zagreb"),
      Team("26469", "Lorient"),
      Team("7176", "Lossiemouth"),
      Team("61179", "Ludogorets"),
      Team("43540", "Lusitanos"),
      Team("10", "Luton"),
      Team("7365", "Luxembourg"),
      Team("26345", "Lyon"),
      Team("62787", "Lyon Women"),
      Team("41220", "MSK Zilina"),
      Team("8420", "Maccabi Haifa"),
      Team("43368", "Maccabi Tel-Aviv"),
      Team("63030", "Maccabi Tel-Aviv/Basle"),
      Team("145", "Macclesfield"),
      Team("12679", "Maidenhead Utd"),
      Team("32676", "Mainz"),
      Team("27826", "Malaga"),
      Team("2560", "Malaysia"),
      Team("37283", "Mali"),
      Team("26237", "Malmo FF"),
      Team("776", "Malta"),
      Team("11", "Man City"),
      Team("12", "Man Utd"),
      Team("58", "Mansfield"),
      Team("7757", "Maribor"),
      Team("63026", "Maribor/Sevilla"),
      Team("26344", "Marseille"),
      Team("38304", "Metallurg Donetsk"),
      Team("57489", "Metalurg"),
      Team("5837", "Mexico"),
      Team("30", "Middlesbrough"),
      Team("13", "Millwall"),
      Team("20", "Milton Keynes Dons"),
      Team("53990", "Minsk"),
      Team("53603", "Mladost Podgorica"),
      Team("26377", "Molde"),
      Team("6526", "Moldova"),
      Team("26343", "Monaco"),
      Team("53897", "Montenegro"),
      Team("26351", "Montpellier"),
      Team("51422", "Montreal Impact"),
      Team("124", "Montrose"),
      Team("215", "Morecambe"),
      Team("112", "Morton"),
      Team("100", "Motherwell"),
      Team("38115", "N.E Revolution"),
      Team("7801", "Nairn County"),
      Team("26350", "Nantes"),
      Team("26370", "Napoli"),
      Team("38366", "Neftchi"),
      Team("40396", "New York Red Bulls"),
      Team("37346", "New Zealand"),
      Team("31", "Newcastle"),
      Team("19337", "Newport County"),
      Team("16363", "Newton Stewart"),
      Team("27462", "Nice"),
      Team("8110", "Nigeria"),
      Team("56150", "Nomme Kalju"),
      Team("59", "Northampton"),
      Team("964", "Northern Ireland"),
      Team("716", "Norway"),
      Team("14", "Norwich"),
      Team("15", "Nottm Forest"),
      Team("63076", "Nottm Forest/Preston"),
      Team("60", "Notts County"),
      Team("7120", "Nuneaton"),
      Team("32323", "Nurnberg"),
      Team("32", "Oldham"),
      Team("32733", "Olimpija Ljubljana"),
      Team("7897", "Olympiacos"),
      Team("8259", "Omonia Nicosia"),
      Team("27152", "Osasuna"),
      Team("13361", "Oxford City"),
      Team("33", "Oxford Utd"),
      Team("8417", "PAOK Salonika"),
      Team("63029", "PAOK Salonika/Benfica"),
      Team("26339", "PSG"),
      Team("26321", "PSV"),
      Team("38488", "Pacos Ferreira"),
      Team("37701", "Panama"),
      Team("51508", "Pandurii Targu-Jiu"),
      Team("8109", "Paraguay"),
      Team("60908", "Paris Saint-Germain Women"),
      Team("26358", "Parma"),
      Team("113", "Partick"),
      Team("6935", "Partizan Belgrade"),
      Team("37261", "Peru"),
      Team("84", "Peterborough"),
      Team("7596", "Peterhead"),
      Team("43335", "Petrolul Ploiesti"),
      Team("59829", "Philadelphia Union"),
      Team("54324", "Piast Gliwice"),
      Team("34", "Plymouth"),
      Team("38336", "Plzen"),
      Team("63025", "Plzen/Shakhtar Donetsk"),
      Team("629", "Poland"),
      Team("35", "Port Vale"),
      Team("51346", "Portland Timbers"),
      Team("36", "Portsmouth"),
      Team("5539", "Portugal"),
      Team("36714", "Prestatyn Town"),
      Team("61", "Preston"),
      Team("23546", "Preston Athletic"),
      Team("43650", "Pyunik"),
      Team("16", "QPR"),
      Team("37314", "Qatar"),
      Team("125", "Queen of South"),
      Team("126", "Queen's Park"),
      Team("114", "Raith"),
      Team("47811", "Randers FC"),
      Team("101", "Rangers"),
      Team("26405", "Rapid Vienna"),
      Team("35724", "Rayo Vallecano"),
      Team("62", "Reading"),
      Team("26314", "Real Betis"),
      Team("63027", "Real Betis/Rubin Kazan"),
      Team("26303", "Real Madrid"),
      Team("50946", "Real Salt Lake"),
      Team("26308", "Real Sociedad"),
      Team("41053", "Reims"),
      Team("26349", "Rennes"),
      Team("494", "Rep of Ireland"),
      Team("27862", "Rijeka"),
      Team("85", "Rochdale"),
      Team("26357", "Roma"),
      Team("823", "Romania"),
      Team("26374", "Rosenborg"),
      Team("848", "Ross County"),
      Team("63", "Rotherham"),
      Team("7802", "Rothes"),
      Team("46218", "Rubin Kazan"),
      Team("43354", "Rudar Pljevlja"),
      Team("5827", "Russia"),
      Team("26461", "SC Freiburg"),
      Team("38385", "SK Liepajas Metalurgs"),
      Team("26533", "SK Sturm Graz"),
      Team("26404", "SV Red Bull Salzburg"),
      Team("469", "Salisbury"),
      Team("26361", "Sampdoria"),
      Team("57149", "San Jose Earthquakes"),
      Team("1676", "San Marino"),
      Team("43371", "Santa Coloma"),
      Team("53908", "Sassuolo"),
      Team("8022", "Saudi Arabia"),
      Team("26249", "Schalke 04"),
      Team("499", "Scotland"),
      Team("87", "Scunthorpe"),
      Team("58560", "Seattle Sounders FC"),
      Team("23324", "Selkirk"),
      Team("498", "Serbia"),
      Team("27821", "Sevilla"),
      Team("38299", "Shakhtar Donetsk"),
      Team("42994", "Shakhter"),
      Team("45586", "Shakhtyor Karagandy"),
      Team("37", "Sheff Utd"),
      Team("63077", "Sheff Utd/Fulham"),
      Team("17", "Sheff Wed"),
      Team("38271", "Shirak"),
      Team("10716", "Shortwood Utd"),
      Team("64", "Shrewsbury"),
      Team("37317", "Singapore"),
      Team("43474", "Siroki Brijeg"),
      Team("43571", "Skenderbeu"),
      Team("6387", "Skoda Xanthi"),
      Team("7376", "Skonto FC"),
      Team("43226", "Slask Wroclaw"),
      Team("38387", "Sliema Wanderers"),
      Team("1577", "Sligo"),
      Team("6601", "Slovakia"),
      Team("7380", "Slovan Bratislava"),
      Team("6605", "Slovenia"),
      Team("8407", "Sochaux"),
      Team("473", "Solihull Moors"),
      Team("7724", "South Africa"),
      Team("23120", "South Korea"),
      Team("18", "Southampton"),
      Team("88", "Southend"),
      Team("220", "Southport"),
      Team("999", "Spain"),
      Team("7425", "Sparta Prague"),
      Team("6997", "Spartak Moscow"),
      Team("23331", "Spartans"),
      Team("40393", "Sporting Kansas City"),
      Team("19", "Spurs"),
      Team("172", "St Albans"),
      Team("16364", "St Cuthbert Wndrs"),
      Team("27408", "St Etienne"),
      Team("26392", "St Gallen"),
      Team("115", "St Johnstone"),
      Team("102", "St Mirren"),
      Team("6488", "St Patricks"),
      Team("12671", "Staines Town"),
      Team("221", "Stalybridge"),
      Team("26295", "Standard Liege"),
      Team("6901", "Steaua Bucuresti"),
      Team("127", "Stenhousemuir"),
      Team("1073", "Stevenage"),
      Team("128", "Stirling"),
      Team("38", "Stoke"),
      Team("478", "Stourbridge"),
      Team("129", "Stranraer"),
      Team("26376", "Stromsgodset"),
      Team("39", "Sunderland"),
      Team("32860", "Sutjeska"),
      Team("150", "Sutton Utd"),
      Team("65", "Swansea"),
      Team("63023", "Swansea/Napoli"),
      Team("5845", "Sweden"),
      Team("40", "Swindon"),
      Team("1660", "Switzerland"),
      Team("26430", "TPS"),
      Team("48490", "TSG Hoffenheim"),
      Team("7087", "Tamworth"),
      Team("58962", "Teteks"),
      Team("7121", "Thailand"),
      Team("3028", "The New Saints FC"),
      Team("17634", "Threave Rovers"),
      Team("10202", "Tonbridge Angels"),
      Team("27038", "Torino"),
      Team("55606", "Toronto FC"),
      Team("27267", "Torpedo Kutaisi"),
      Team("90", "Torquay"),
      Team("26346", "Toulouse"),
      Team("26448", "Trabzonspor"),
      Team("66", "Tranmere"),
      Team("38222", "Trans Narva"),
      Team("43079", "Tre Penne"),
      Team("7347", "Trinidad and Tobago"),
      Team("26385", "Tromso"),
      Team("10883", "Truro City"),
      Team("1661", "Turkey"),
      Team("57483", "UE Santa Coloma"),
      Team("7356", "USA"),
      Team("26360", "Udinese"),
      Team("6272", "Ukraine"),
      Team("37331", "United Arab Emirates"),
      Team("37260", "Uruguay"),
      Team("37327", "Uzbekistan"),
      Team("59974", "VMFD Zalgiris"),
      Team("12783", "Vale Of Leithen"),
      Team("26316", "Valencia"),
      Team("32811", "Valenciennes"),
      Team("26319", "Valladolid"),
      Team("33051", "Valletta"),
      Team("51344", "Vancouver Whitecaps"),
      Team("43338", "Vardar"),
      Team("24612", "Vauxhall Motors"),
      Team("33062", "Venezuela"),
      Team("27648", "Verona"),
      Team("26250", "VfB Stuttgart"),
      Team("38429", "Videoton FC"),
      Team("58712", "Vikingur"),
      Team("38295", "Villarreal"),
      Team("26324", "Vitesse"),
      Team("7377", "Vojvodina"),
      Team("630", "Wales"),
      Team("67", "Walsall"),
      Team("41", "Watford"),
      Team("152", "Welling"),
      Team("26252", "Werder Bremen"),
      Team("42", "West Brom"),
      Team("43", "West Ham"),
      Team("10215", "Weston-S-Mare"),
      Team("23417", "Whitehill Welfare"),
      Team("7796", "Wick Academy"),
      Team("68", "Wigan"),
      Team("27375", "Wigtown & Bladnoch"),
      Team("702", "Woking"),
      Team("26257", "Wolfsburg"),
      Team("62786", "Wolfsburg Women"),
      Team("44", "Wolverhampton"),
      Team("6907", "Worcester"),
      Team("7085", "Workington"),
      Team("91", "Wrexham"),
      Team("153", "Wycombe"),
      Team("6870", "Yeovil"),
      Team("92", "York"),
      Team("37275", "Zambia"),
      Team("33035", "Zeljeznicar Sarajevo"),
      Team("38276", "Zenit St Petersburg"),
      Team("38228", "Zrinjski Mostar"),
      Team("32471", "Zulte-Waregem"),
    )
  }
}
