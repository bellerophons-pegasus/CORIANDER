# CORIANDER
COurse RegIstry stAtistics aNd aDditional matERial - Adding further functionalities to the DH Cource Registry by CLARIN and DARIAH
https://bellerophons-pegasus.github.io/CORIANDER/

## Motivation
This project was started and executed during the second [ACDH-CH Open Data Virtual Hackathon](https://www.oeaw.ac.at/acdh/detail/event/acdh-ch-open-data-virtual-hackathon-round-two/) in March 2020.

The task was to work with data provided by the [Digital Humanities Course Registry](https://dhcr.clarin-dariah.eu/) (DHCR), a curated platform providing an overview of available teaching activities in the field of digital humanities worldwide. The Course Registry is provided by [CLARIN-ERIC](https://www.clarin.eu/) and [DARIAH-EU](https://www.dariah.eu/).

## The Dataset
The data is provided via an [open API](https://dhcr.clarin-dariah.eu/api/v1/) which outputs a list of courses in json format. For each course several attributes are given: a name, a description, the start date, an url, the language, its type, information about the hosting institution, its city and its country, as well as keywords for three categories. The keyword categories are: Disciplines, TaDiRAH Objects, and TaDiRAH Techniques. [TaDiRAH](https://github.com/dhtaxonomy/TaDiRAH) is a community-driven taxonomy of digital research activities in the humanities.

The full course registry includes a total of 377 course entries, but only 243 are currently maintained and displayed on the DHCR webpage.

## Idea(s)
While the DHCR primarily offers a map based view four course exploration the three keyword categories in the filter options caught our attention. We thought: Why not explore the courses by keywords, with further options to narrow down on countries and start years?

### Exploration by Keywords
This resulted into a [page with a bar chart](https://bellerophons-pegasus.github.io/CORIANDER/index.html) as centre piece. The chart gives a very quick overview on the amount of courses for each discipline, object or technique. A country can be selected as well as a specific year. When navigating this it can be very quickly seen, that in some years no courses started and that from 2015 onwards a larger increase in courses is visible.

This leads to a few questions: Why are there gaps? Where does the increase of 2015 come from? Is it related to actually more courses being offered or did the DHCR just got more attention? How complete is the DHCR? (There is a nice paper on this for the Anglophone world by [C. A. Sula, S. E. Hackney and P. Cunningham: A Survey of Digital Humanities Programs](https://jitp.commons.gc.cuny.edu/a-survey-of-digital-humanities-programs/))

### Adding to the Course Registry
But instead of diving into the question of the coverage and completeness of the DHCR for Europe, we skipped right to "What could help in making the DHCR more attractive to both  teachers and students?"

The result can be seen below the bar chart, where all courses matching the chart or a specific selection (it is possible to select keywords by clicking on the bars) are listed. When clicking on a course, a modal window appears with additional information about the course. So up until here, nothing very different from the DHCR itself. What is different though, is that the keywords are explicitly listed and we make use of them.

Since the keywords are based on the TaDiRAH taxonomy, which is also used elsewhere, we decided to investigate if any of those external sources could be useful for a teaching resource.

We found, as one example, the [Zotero bibliography "Doing Digital Humanities"](https://www.zotero.org/groups/113737/doing_digital_humanities_-_a_dariah_bibliography), a curated list of introductory literature references for the Digital Humanities. It also contains a subset of highlighted references. Now all highlighted references with keywords matching those from the current course on display are listed in the modal window ("Additional Literature - From Zotero"). Furthermore, we added a link to each keyword that brings the user to the bibliography with matching tags already selected (marked with small red Zotero icon).

To add even more references, and because it is openly and easily available, we also crafted a mapping between the TaDiRAH taxonomy and [Wikidata](https://www.wikidata.org) items. With that we were then able to query Wikidata and display resulting references in the modal window. Again, a link (marked with a small green Scholia icon) was added to each keyword that brings the user to Scholia with the respective keyword already set as topic. [Scholia](https://tools.wmflabs.org/scholia/) is a tool developed to fetch publication information from Wikidata.

### Exploring Co-occurrence of Keywords
After all this we were not yet done. Another question popped up along the way: Which keywords are frequently used together and which not? Is it possible to see any pattern?

This resulted in the second [page with a chord diagram](https://bellerophons-pegasus.github.io/CORIANDER/chord.html) as its centre piece.

## How To
1. Clone this repository
2. Open index.html with your browser (project was developed for Firefox and Chrome)
  * If the page doesn't display:
    * Check if JavaScript is supported or enabled
    * In Firefox 68 local files might be treated as cross origin and won't work. You'll need to change your settings in `about:config` for `privacy.file_unique_origin` (from true to false). See [this issue](https://discourse.mozilla.org/t/firefox-68-local-files-now-treated-as-cross-origin-1558299/42493) for more information.
3. Alternatively just go to https://bellerophons-pegasus.github.io/CORIANDER/
4. Happy selecting, sliding and clicking!

### Updating Source Files
If you wan't to have the latest literature from e.g. Wikidata or one of the other used sources:
1. Execute the corresponding Python script in one of the corresponding subfolders.
  * Sources/courseRegistryData/getCrData.py updates course list
  * Sources/courseRegistryData/getCrDataMat.py updates data for chord diagram
  * Sources/wikidata/queryWikidata.py updates literature list from Wikidata
  * Sources/zotero-DHLit/zotero_json.py updates literature list from Zotero. Note that a file zotero_custom.js is currently provided and used. Literature in there was enriched with more tags.

## How it Works (i.e. What did we do?)
TODO

TaDiRAH:
* https://github.com/dhtaxonomy/TaDiRAH
* http://tadirah.dariah.eu/vocab/index.php
* https://www.wikidata.org/wiki/Wikidata:Property_proposal/TaDiRAH_ID

Zotero:
* https://www.zotero.org/groups/113737/doing_digital_humanities_-_a_dariah_bibliography


## More Potential Sources for Enrichment:
* PARTHENOS Standardization Survival Kit: https://github.com/ParthenosWP4/SSK
* List of DARIAH contributions at DANS: https://dariah-beta.dans.knaw.nl/info
* TAPoR (successor of DiRT Directory): http://tapor.ca/?goto=pages/useful_links&

## Problems, summarised
### Course Registry
* Distinguishing between recent and historical data not obvious (we assumed a last updated date of 2019 or higher for recent entries)
* Dates of coures not all in same format. This is dealt with during import in the Python script.
* Dates of about 40 courses are missing, which is why they are not taken into account
* Labels of keywords sometimes do not contain spaces, e.g. `ResearchResults` instead of `Research Results`
* Some labels of keywords have surrounding whitespace that should be trimmed off
* Some keywords are duplicated (e.g Media Culture, Maastricht -> `Research`; or Initiation in XML-TEI coding of heritage texts (Course) Université Francois-Rabelais (2005) -> `Theory and Methodology of DH` and `Linguistics and Language Studies`)

### TaDiRAH
* List of projects using TaDiRAH provided on GitHub repository is outdated
* TaDiRAH terms are not used consistently across different projects
* Some terms are very general (e.g. data, link ...)
* Lack of descriptions for Objects and Techniques
* Digital Humanities is not a discipline, but an Object, which seems odd; Whereas Theory and Methodology of DH is listed as a discipline

### Zotero Bibliography - Doing Digital Humanities
* Multiple tags for the same TaDiRAH term are used (e.g. `obj_Infrastructures; object: Infrastructure; Object: Infrastructures` for `Infrastructure`)
* Though it is a curated list, many entries lack comprehensive tags. Thus, we created an enriched version of the 40 starred references (see [Sources/zotero-DHLit/zotero_custom.js](https://github.com/bellerophons-pegasus/CORIANDER/blob/master/Sources/zotero-DHLit/zotero_custom.js))
* It is a list from DARIAH-DE and therefore contains more German references

### Wikidata
* Mapping from TaDiRAH to Wikidata items had to be created (see [Sources/tadirah-mapping.csv](https://github.com/bellerophons-pegasus/CORIANDER/blob/master/Sources/tadirah-mapping.csv))
* Not all terms are present as items in Wikidata and would have to be created. We refrained from this task, because we would then still not have any literature references with that topics.
* Not all terms can be matched precisely. Especially the ones for the disciplines.
* Some terms are very general, which results in a timeout when querying for the terms and any possible sub-terms (e.g. data).
* Publications in Wikidata are far from complete. Many do not have any subjects at all.
* All disciplines are represented on Wikidata, which may result in literature not really relevant for DH courses. This could be improved by honing the query.
