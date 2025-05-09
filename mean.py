import pandas as pd

#Load the dataset
df = pd.read_csv("/Users/matheinen/Desktop/archive/books_data.csv")

#Print total number of rows
print(f"Number of rows: {len(df)}")

#Drop rows with any missing vals
df_clean = df.dropna()


# Save the cleaned data to a new CSV file
df_clean.to_csv("/Users/matheinen/Desktop/archive/Books_data_cleaned.csv", index=False)

################################################################

#New Run Starts Here
import pandas as pd

#Load cleaned books data
books_df = pd.read_csv("/Users/matheinen/Desktop/archive/Books_data_cleaned.csv")

#Load cleaned ratings data
ratings_df = pd.read_csv("/Users/matheinen/Desktop/archive/Books_rating_cleaned.csv")

#Filter ratings where the Title exists in books data
valid_titles = set(books_df["Title"].dropna())
filtered_ratings_df = ratings_df[ratings_df["Title"].isin(valid_titles)]



# Save the filtered ratings to a new CSV
filtered_ratings_df.to_csv("/Users/matheinen/Desktop/archive/Books_rating_final_clean.csv", index=False)

################################################################

#New run starts here
import pandas as pd
import re

# Load cleaned books data
books_df = pd.read_csv("/Users/matheinen/Desktop/archive/Books_data_cleaned.csv")

# Extract authors 
authors_series = books_df["authors"].dropna()

# Split authors if they are separated by commas or semicolons
split_authors = authors_series.str.split(',|;')

# Flatten strip and clean each author name
all_authors = []
for sublist in split_authors:
    for author in sublist:
        cleaned_author = author.strip()
        # Remove surrounding quotes/brackets and unwanted characters
        cleaned_author = re.sub(r'[\[\]"\']', '', cleaned_author)
        if cleaned_author:
            all_authors.append(cleaned_author)

# Get unique authors with the help of sorted keyword
unique_authors = sorted(set(all_authors))

# Create DataFrame
authors_df = pd.DataFrame({
    "Author_ID": range(1, len(unique_authors) + 1),
    "Author_Name": unique_authors
})

# Save this to a new CSV
authors_df.to_csv("/Users/matheinen/Desktop/archive/authors.csv", index=False)

################################################################
#New run starts here

import pandas as pd
import re

#Load cleaned books and authors data
books_df = pd.read_csv("/Users/matheinen/Desktop/archive/Books_data_cleaned.csv")
authors_df = pd.read_csv("/Users/matheinen/Desktop/archive/authors.csv")

# Create mapping from author name to id
author_name_to_id = dict(zip(authors_df["Author_Name"], authors_df["Author_ID"]))

written_by_rows = []

#Iterate through each book
for _, row in books_df.iterrows():
    title = row["Title"]
    raw_authors = row["authors"]

    #Split authors and clean each one
    authors = re.split(r',|;', raw_authors)
    for author in authors:
        cleaned_author = author.strip()
        cleaned_author = re.sub(r'[\[\]"\']', '', cleaned_author)

        if cleaned_author in author_name_to_id:
            author_id = author_name_to_id[cleaned_author]
            written_by_rows.append({
                "Author_ID": author_id,
                "Author_Name": cleaned_author,
                "Book_Title": title
            })
        else:
            print(f"Warning: Author '{cleaned_author}' not found in authors.csv")

#Save this
written_by_df = pd.DataFrame(written_by_rows)
written_by_df.to_csv("/Users/matheinen/Desktop/archive/writtenBy.csv", index=False)

################################################################
#New run starts here

import pandas as pd

#Load data
ratings_df = pd.read_csv("/Users/matheinen/Desktop/archive/Books_rating_final_clean.csv")

#Drop duplicates to get unique users
unique_users_df = ratings_df[["User_id", "profileName"]].drop_duplicates().reset_index(drop=True)

#Create email and pass cols
unique_users_df["Email"] = ["test" + str(i+1) + "@pennNet.org" for i in range(len(unique_users_df))]
unique_users_df["Password"] = "books"

unique_users_df.to_csv("/Users/matheinen/Desktop/archive/users.csv", index=False)

################################################################
#New run starts here


import pandas as pd
from datetime import datetime

#Load final ratings data
ratings_df = pd.read_csv("/Users/matheinen/Desktop/archive/Books_rating_final_clean.csv")

#Drop duplicates to get unique reviews
unique_reviews_df = ratings_df[["User_id", "Title", "review/text", "review/time"]].drop_duplicates().reset_index(drop=True)

#Generate ReviewID
unique_reviews_df["RatingID"] = unique_reviews_df.index + 1

#Convert Unix timestamp
unique_reviews_df["review/time"] = pd.to_datetime(unique_reviews_df["review/time"], unit='s')

#Rename cols
unique_reviews_df.rename(columns={
    "User_id": "UserID",
    "Title": "BookTitle",
    "review/text": "ReviewText",
    "review/time": "ReviewDate"
}, inplace=True)

#Reorder columns for the schema
final_df = unique_reviews_df[["RatingID", "UserID", "BookTitle", "ReviewText", "ReviewDate"]]

final_df.to_csv("/Users/matheinen/Desktop/archive/reviewsFinal.csv", index=False)


################################################################

#Nw run starts here

import pandas as pd

#Load datasets
authors_df = pd.read_csv("/Users/matheinen/Desktop/archive/authors.csv")
books_df = pd.read_csv("/Users/matheinen/Desktop/archive/Books_data_cleaned.csv")

#Merge on author name to bring in Author_ID
merged_df = books_df.merge(authors_df, how='left', left_on='authors', right_on='Author_Name')

merged_df.rename(columns={"Author_ID": "authorID"}, inplace=True)

# Dropping the 'Author_Name' column bc its not needed
merged_df.drop(columns=["Author_Name"], inplace=True)

columns = list(merged_df.columns)
columns.append(columns.pop(columns.index("authorID")))
merged_df = merged_df[columns]
merged_df.to_csv("/Users/matheinen/Desktop/archive/Books_data_with_authors.csv", index=False)