import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import StudentHome from './student/StudentHome'
function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        {/* <Route path="/" element={<Student />} /> */}
        <Route path="/" element={<StudentHome />} />

        <Route path="/instructor" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
