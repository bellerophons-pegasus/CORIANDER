#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Mar 16 21:12:43 2020

@author: lukas and martina

A script to create a json object from a comma separated table containing
mappings for the TaDiRAH labels used in the DH Course Registry by DARIAH
to Wikidata and to the Zotero library 113737 'Doing Digital Humanities'
"""

import csv
import json

# we want to create a list with a dictionary [{}] to resemble a valid json object
mappingdata =  []
csvmap = {}
# open and read comma separated file
with open('tadirah-mapping.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    # skip first line
    next(csv_reader)
    # from each row get the mappings
    # column 3: Course Registry, 4: Wikidata, 7: Zotero, 8: custom enriched Zotero
    for row in csv_reader:
            # the dictionary csvmap will contain key value pairs, where the value
            # is another dictionary csvmap2 with key value pairs
            csvmap2 = {}
            # columns may contain more than one label; they are separated with ';'
            # and thus a list is added as a value for the given key
            csvmap2['zotero'] = row[7].split(';')
            csvmap2['new_zotero'] = row[8].split(';')
            csvmap2['wikidata']=row[4].split(';')

            # bringing together the key of csvmap with the value contained in csvmap2
            csvmap[row[3]] = csvmap2
    # add the new dictionary to our list 'mappingdata'
    mappingdata.append(csvmap)
print(mappingdata)

# create js file
with open('mapping.js', 'w') as outfile:
    # store whole json object as js variable
    outfile.write('var mapping = ')
    # create json from the list mappingdata that contains dictionaries for each
    # TaDiRAH term found in the Course Registry
    json.dump(mappingdata, outfile)
