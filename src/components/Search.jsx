import React from 'react'

const Search = ({searchTerm,setSearchTerm}) => {
    return(
        <div className="search">
            <div>
                <img src="Vector.svg" alt="icon" className="search_icon" />

                <input type="text"
                    placeholder='Search any movies' 
                    className="search_bar"
                    value={searchTerm}  
                    onChange={(event)=>{setSearchTerm(event.target.value)}}
                  />
            </div>
        </div>
    )
}
export default Search