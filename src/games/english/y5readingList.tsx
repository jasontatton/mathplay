import React from "react";
import bookData from "./book_metadata_y5.json";
import Booklist from "./Booklist";

const Y5ReadingList: React.FC = () => {
    return (
        <div style={{padding: 20}}>
            <Booklist books={bookData}/>
        </div>
    );
};

export default Y5ReadingList;
