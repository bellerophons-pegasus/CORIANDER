# CORIANDER
COurse RegIstry stAtistics aNd aDditional matERial - Adding further functionalities to the DH Cource Registry by CLARIN and DARIAH
https://bellerophons-pegasus.github.io/CORIANDER/

## Motivation
This project was started and executed during the second [ACDH-CH Open Data Virtual Hackathon](https://www.oeaw.ac.at/acdh/detail/event/acdh-ch-open-data-virtual-hackathon-round-two/) in March 2020.

The task was to work with data provided by the [Digital Humanities Course Registry](https://dhcr.clarin-dariah.eu/) (DHCR), a curated platform providing an overview of available teaching activities in the field of digital humanities worldwide. The Course Registry is provided by [CLARIN-ERIC](https://www.clarin.eu/) and [DARIAH-EU](https://www.dariah.eu/).

## Idea
Instead of exploring the courses with the map based view provided by the DHCR, we were interested in an exploration by keywords with further narrowing down by countries and years.


Explore the courses by keywords, countries and years. Below the plot a list with courses matching the current selection is displayed. By clicking on one of that courses further information and additional literature from a Zotero bibliography and Wikidata is displayed.


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
