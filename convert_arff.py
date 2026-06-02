import re
import csv

input_file = 'Chronic_Kidney_Disease/chronic_kidney_disease.arff'
output_file = 'data/kidney.csv'

# Define columns in order from the @attribute headers
columns = [
    'age', 'bp', 'sg', 'al', 'su', 'rbc', 'pc', 'pcc', 'ba', 'bgr', 
    'bu', 'sc', 'sod', 'pot', 'hemo', 'pcv', 'wbcc', 'rbcc', 'htn', 
    'dm', 'cad', 'appet', 'pe', 'ane', 'classification'
]

data_started = False
rows = []

with open(input_file, 'r') as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        if line.lower().startswith('@data'):
            data_started = True
            continue
        if not data_started:
            continue
        
        # Split row by comma, strip whitespace, handle custom string anomalies
        row = [val.strip().strip("'").strip('"') for val in line.split(',')]
        
        # Ensure row has exactly the right number of elements
        if len(row) == len(columns):
            # Standardize DM yes/no whitespaces and values (e.g. '\tyes' -> 'yes')
            # The dataset sometimes contains '\tyes' or 'yes\t' or ' no'
            row = [val.replace('\t', '').strip() for val in row]
            rows.append(row)

# Write to CSV
with open(output_file, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(columns)
    writer.writerows(rows)

print(f"Successfully converted ARFF dataset to CSV: {output_file} with {len(rows)} instances!")
