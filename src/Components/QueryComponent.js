import React, { useState } from "react";
import axios from "axios";
import './QueryComponent.css';


const QueryComponent = () => {
  const [queryText, setQueryText] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleQuery = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/collection/pdf_collection/query",
        {
          queryTexts: [queryText],
          nResults: 5, // Number of results to return
        }
      );
      setResults(response.data.documents);
    } catch (err) {
      console.error("Error querying:", err);
      setError("Error querying the database");
    }
  };

  return (
    <div className="query-container">
      <h1>Query ChromaDB</h1>
      <input
        className="query-text-box"
        type="text"
        value={queryText}
        onChange={(e) => setQueryText(e.target.value)}
        placeholder="Enter your query"
      />
      <button className="query-button" onClick={handleQuery}>
        Query
      </button>
      {error && <p>{error}</p>}
      <div className="results">
        <h2>Results</h2>
        <ul className="results-list">
          {results.map((result, index) => (
            <li key={index} className="result-item">
              {result.map((paragraph, pIndex) => (
                <p key={pIndex} className="result-paragraph">{paragraph}</p>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default QueryComponent;
