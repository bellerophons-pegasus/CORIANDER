# CORIANDER
COurse RegIstry stAtistics aNd aDditional matERial - Adding further functionalities to the DH Cource Registry by CLARIN and DARIAH

View webpage: https://bellerophons-pegasus.github.io/CORIANDER/

##### Table of contents
* [Motivation](#motivation)
* [Dataset](#the-dataset)
* [Idea(s)](#ideas)
* [Exemplary Use Case](#exemplary-use-case)
* [How To](#how-to)
* [How it Works & Issues](#how-it-works-ie-what-did-we-do)
* [Known Bugs](#known-bugs-and-shortcomings)

## Motivation
This project was started and executed during the second [ACDH-CH Open Data Virtual Hackathon](https://www.oeaw.ac.at/acdh/detail/event/acdh-ch-open-data-virtual-hackathon-round-two/) in March 2020.

The task was to work with data provided by the [Digital Humanities Course Registry](https://dhcr.clarin-dariah.eu/) (DHCR), a curated platform providing an overview of available teaching activities in the field of digital humanities worldwide. The Course Registry is provided by [CLARIN-ERIC](https://www.clarin.eu/) and [DARIAH-EU](https://www.dariah.eu/).

## The Dataset
The data is provided via an [open API](https://dhcr.clarin-dariah.eu/api/v1/) which outputs a list of courses in json format. For each course several attributes are given: a name, a description, the start date, an url, the language, its type, information about the hosting institution, its city and its country, as well as keywords for three categories. The keyword categories are: Disciplines, TaDiRAH Objects, and TaDiRAH Techniques. [TaDiRAH](https://github.com/dhtaxonomy/TaDiRAH) is a community-driven taxonomy of digital research activities in the humanities.

As of March 2020 the full course registry includes a total of 377 course entries, but only 243 are currently maintained and displayed on the DHCR webpage. We worked with the full registry, but only included the 329 courses with a start date.

## Idea(s)
While the DHCR primarily offers a map based view for course exploration the three keyword categories in the filter options caught our attention. We thought: Why not explore the courses by keywords, with further options to narrow down on countries and start years?

### Exploration by Keywords
This resulted into a [page with a bar chart](https://bellerophons-pegasus.github.io/CORIANDER/index.html) as centre piece. The chart gives a very quick overview on the amount of courses for each discipline, object or technique. A country can be selected as well as a specific year. When navigating this it can be very quickly seen, that in some years no courses started and that from 2015 onwards a larger increase in courses is visible.

This leads to a few questions: Why are there gaps? Where does the increase of 2015 come from? Is it related to actually more courses being offered or did the DHCR just get more attention? How complete is the DHCR? (There is a nice paper on this for the Anglophone world by [C. A. Sula, S. E. Hackney and P. Cunningham: A Survey of Digital Humanities Programs](https://jitp.commons.gc.cuny.edu/a-survey-of-digital-humanities-programs/))

### Adding to the Course Registry
But instead of dwelling on the question of coverage and completeness of the DHCR for Europe, we skipped right to "What could help in making the DHCR more attractive to both teachers and students?", because we assume that quantity will come with an increased usefulnes of the platform.

The result can be seen below the bar chart, where all courses matching the chart or a specific selection (select keywords by clicking on the bars) are listed. When clicking on a course, a modal window appears with additional information about the course. Contrary to the DHCR the keywords are explicitly listed for each course and we make use of them.

Since the keywords are based on the TaDiRAH taxonomy, which is also used elsewhere, we decided to investigate if any of those external sources could be useful for a teaching resource such as the DHCR.

We found, as one example, the [Zotero bibliography "Doing Digital Humanities"](https://www.zotero.org/groups/113737/doing_digital_humanities_-_a_dariah_bibliography), a curated list of introductory literature references for the Digital Humanities. It also contains a subset of highlighted references (tag `*****`), which we further enriched with tags (see [Sources/zotero-DHLit/zotero_custom.js](https://github.com/bellerophons-pegasus/CORIANDER/blob/master/Sources/zotero-DHLit/zotero_custom.js)). Now if any of the tags in those references matches the keywords from the current course on display, the respective reference is listed in the modal window ("Additional Literature -> From Zotero"). Furthermore, we added a link (marked with small red Zotero icon) to each keyword that directs the user to the bibliography on Zotero with matching tags already selected.

To add even more references, and because it is openly and easily available, we also crafted a mapping between the TaDiRAH taxonomy and [Wikidata](https://www.wikidata.org) items. With that we were then able to query Wikidata and display resulting references in the modal window. Again, a link (marked with a small green Scholia icon) was added to each keyword that brings the user to Scholia with the respective keyword already set as topic. [Scholia](https://tools.wmflabs.org/scholia/) is a tool developed to fetch publication information from Wikidata.

### Exploring Co-occurrence of Keywords
After all this we were not yet done. Another question popped up along the way: Which keywords are frequently used together and which not? Is it possible to see any pattern?

This resulted in the second [page with a chord diagram](https://bellerophons-pegasus.github.io/CORIANDER/chord.html) as centre piece. The chart is based on the co-occurrences of keywords in the courses, i.e. if e.g. "Linked Open Data" and "Computer Science" are used together in a course, the co-occurrence count is increased.

The default view displays all keywords, but for the sake of clarity only shows the five most frequent co-occurrences for each keyword. The available checkboxes and the slider allow for customisation.

Note that the top five (or any other selected value) connections from one keyword might not be in the top five of another connected keyword. This is visible with the very thin and fading arcs.

## Exemplary Use Case
* Lets say one is interested in the technique Linked Open Data (a total of 98 courses in the CR)
* Use the courses page with the bar chart and browse through the available courses
![Bar Chart with LOD selected](/usecase/start_bar.png)
* You can also select a year and/or a country to narrow down the course list
* For each course in this list there is additional literature (from Zotero and Wikidata) available, which is shown by clicking on the respective course
![Additional literature for the selected LOD course](/usecase/addlit.png)
* Now you want to know which disciplines connect to your topic of interest: Linked Open Data
* On the page keywords you will first see the top 5 connections between all TaDiRAH Objects/Techniques and Disciplines
![All keywords in a chord diagram](/usecase/keywordsall.png)
* Since you are interested in the disciplines you can redraw the co-occurrence plot with a finer selection
  * Select all disciplines and the technique Linked Open Data and redraw with this selection
  * Now the top 5 connections between your topic of interest and the disciplines are shown
![Chord diagram for a specific selection](/usecase/selection.png)
* Linked Open Data connects to: Theory and Methodology of DH, Computer Science, Arts and Cultural Studies, History as well as Linguistic and Language Studies
![Top 5 connections for LOD to disciplines](/usecase/lod.png)
* These results can also be altered by changing the maximum number of connections being shown (with the slider) or by displaying all available connections (this might slow or even crash the browser window dependent on the total number of connections available)

## How To
1. Clone this repository
2. Open index.html with your browser (ideally Firefox or Chrome; Edge might also work; other browsers were not tested; the page does not work in Internet Explorer)
  * If the page doesn't display:
    * Check if JavaScript is supported or enabled
    * In Firefox 68 local files might be treated as cross origin and won't work. You'll need to change your settings in `about:config` for `privacy.file_unique_origin` (from true to false). See [this issue](https://discourse.mozilla.org/t/firefox-68-local-files-now-treated-as-cross-origin-1558299/42493) for more information.
3. Alternatively just go to https://bellerophons-pegasus.github.io/CORIANDER/ were the current status of the repository is on display
4. Happy selecting, sliding and clicking!

### Updating Source Files
If you want to have the latest literature from e.g. Wikidata or one of the other used sources:
1. Execute the corresponding Python script in one of the corresponding subfolders.
  * Sources/courseRegistryData/getCrData.py updates course list
  * Sources/courseRegistryData/getCrDataMat.py updates data for chord diagram
  * Sources/wikidata/queryWikidata.py updates literature list from Wikidata
  * Sources/zotero-DHLit/zotero_json.py updates literature list from Zotero. Note that a file zotero_custom.js is currently provided and used. Literature in there was enriched with more tags.
  * Sources/mapping.py to update the mapping based on the content in Sources/tadirah-mapping.csv

## How it Works (i.e. What did we do?)
* We used Python 3 for our Python scripts.
* For the webpage HTML, CSS and JavaScript was used.
* For the bar chart we used the [Plotly JavaScript Open Source Graphing Library](https://plotly.com/javascript/)
* For the chord diagram we used [D3.js](https://d3js.org/)

### Getting Data from the Course Registry
Data is fetched with a Python script (Sources/courseRegistryData/getCrData.py) from the DHCR's [public API](https://dhcr.clarin-dariah.eu/api/v1/) and written in JSON format into Soucres/courseRegistryData/index.js for further use by our custom JavaScript.

In another Python script (Sources/courseRegistryData/getCrDataMat) DHCR's data is transformed into more specific arrays (a matrix and two lists) and JSON for the chord diagram and written into Sources/courseRegistryData/dataMat.js.

#### Issues we had with the Course Registry
* Distinguishing between recent and historical data is not obvious. We assumed a last updated date of 2019 or higher for recent entries.
* Dates of coures are not all in the same format. This is dealt with during import in the Python script.
* Dates of about 40 courses are missing, which is why they are not taken into account, thus not displayed.
* Labels of keywords sometimes do not contain spaces, e.g. `ResearchResults` instead of `Research Results`
* Some labels of keywords have surrounding whitespace that should be trimmed off (we did so for matching)
* Some keywords are duplicated (e.g in the course Media Culture, Maastricht -> `Research`; or in the course Initiation in XML-TEI coding of heritage texts (Course) Université Francois-Rabelais (2005) -> `Theory and Methodology of DH` and `Linguistics and Language Studies`)

### Display of Course Data
For the bar chart and the detail view of courses `index.html` contains the relevant HTML code, which is further expanded with the script `script.js`. Inline comments should help in clarifying what is going on in there.

For the chord diagram `chord.html` contains the relevant HTML code, which is further expanded with the script `scriptChord.js`. Inline comments should help in clarifying what is going on in there.

Layout and pretty optics is done with a custom CSS style sheet `Styling/style.css` and a bit of JavaScript.


### Mapping TaDiRAH, the DHCR, Zotero and Wikidata
In order to be able to fetch additional material a matching of the keywords used in the courses with the other designated sources (Zotero and Wikidata) had to be done.

The keywords used in the DHCR are based on [TaDiRAH](https://github.com/dhtaxonomy/TaDiRAH), a community-driven taxonomy of digital research activities in the humanities. The TaDiRAH taxonomy is also available on a [dedicated webpage](http://tadirah.dariah.eu/vocab/index.php).

For the mapping the csv file `Sources/tadirah-mapping.csv` was prepared. It contains the machine names and labels of TaDiRAH, which are all aligned with the keywords used in the DHCR, the tags used in Zotero, and matching Wikidata items. Though the disciplines are not part of the TaDiRAH taxonomy we were still able to match them to a few tags in the Zotero bibliography and to Wikidata items.

#### Issues we had with TaDiRAH
* The list of projects using TaDiRAH provided on its GitHub repository is outdated
* TaDiRAH terms are not used consistently across different projects
* Some terms are very general (e.g. data, link ...)
* Lack of descriptions for Objects and Techniques
* Digital Humanities is not a discipline, but an Object, which seems odd; Whereas Theory and Methodology of DH is listed as a discipline

#### Issues we had with the [Zotero bibliography "Doing Digital Humanities"](https://www.zotero.org/groups/113737/doing_digital_humanities_-_a_dariah_bibliography)
* Multiple tags for the same TaDiRAH term are used (e.g. `obj_Infrastructures; object: Infrastructure; Object: Infrastructures` for `Infrastructure`)
* Though it is a curated list, many entries lack comprehensive tags. Thus, we created an enriched version of the 40 starred references (tag `*****`; see [Sources/zotero-DHLit/zotero_custom.js](https://github.com/bellerophons-pegasus/CORIANDER/blob/master/Sources/zotero-DHLit/zotero_custom.js))
* It is a list from DARIAH-DE and therefore contains more German references


#### Issues we had with mapping to Wikidata
* We created a [property proposal on Wikidata](https://www.wikidata.org/wiki/Wikidata:Property_proposal/TaDiRAH_ID), which is already ready for creation
  * This is currently on hold, due to current developments for TaDiRAH announced in [this blog post](https://dhd-blog.org/?p=13108)
* Not all terms are present as items in Wikidata and would have to be created. We refrained from this task, because we would then still not have any literature references with that topics.
* Not all terms can be matched precisely. Especially the ones for the disciplines.
* Some terms are very general, which results in a timeout when querying for the terms and any possible sub-terms (e.g. data). This applies to both querying via the Python script `Sources/wikidata/queryWikidata.py` and opening the respective links to Scholia.
* Publications in Wikidata are far from complete. Many do not have any subjects at all and even more are simply not present on Wikidata.
* All disciplines are represented on Wikidata, which may result in literature not really relevant for DH courses. This could be improved by honing the query.

### More Potential Sources for Enrichment:
* PARTHENOS Standardization Survival Kit: https://github.com/ParthenosWP4/SSK
* List of DARIAH contributions at DANS: https://dariah-beta.dans.knaw.nl/info
* TAPoR (successor of DiRT Directory): http://tapor.ca/?goto=pages/useful_links&

## Known Bugs and Shortcomings
* In `Sources/wikidata/queryWikidata.py` the exception `except json.decoder.JSONDecodeError` might not work.
  * Workaround: uncomment that line and use `expect:` instead
* The labels in the chord diagram are sometimes cut off
* Webpage was crafted for full desktop view, no mobile version
* Webpage does not work in Internet Explorer
