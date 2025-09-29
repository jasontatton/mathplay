import React from "react";
import bookData from "./book_metadata.json";
import BookList from "./booklist"; // your JSON file

const Y4ReadingList: React.FC = () => {
    return (
        <div style={{padding: 20}}>
            <BookList books={bookData}/>
        </div>
    );
};

export default Y4ReadingList;
