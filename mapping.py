#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Mar 16 21:12:43 2020

@author: lukas
"""

import csv
import json

# 0: CR, 1: Zotero, 2: WikiData

data =  []
csvmap = {}
with open('tadirah-mapping.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    next(csv_reader)
    for row in csv_reader:
            
            csvmap2 = {}
            
            csvmap2['zotero'] = row[7]
            csvmap2['new_zotero'] = row[12]
            csvmap2['wikidata']=row[4]
            
            csvmap[row[3]] = csvmap2
    data.append(csvmap)


print(data)



with open('mapping.js', 'w') as outfile:
    
    outfile.write('var mapping = ')
    json.dump(data, outfile)






















