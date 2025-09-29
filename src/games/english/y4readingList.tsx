import React from "react";
import bookData from "./book_metadata.json";
import Booklist from "./Booklist"; // your JSON file

const Y4ReadingList: React.FC = () => {
    return (
        <div style={{padding: 20}}>
            <Booklist books={bookData}/>
        </div>
    );
};

export default Y4ReadingList;
