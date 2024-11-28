import './App.css'
import {BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {ShowTimeWSClient} from "./views/ShowTimeWSClient.tsx";

function App() {


  return (
    <>
     <Router>
         <Routes>
             <Route path="/" element = {<ShowTimeWSClient />} />
         </Routes>
     </Router>
    </>
  )
}

export default App
