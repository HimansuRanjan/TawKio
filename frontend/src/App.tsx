import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import UpdateProfile from './pages/UpdateProfile'
import UpdatePassword from './pages/UpdatePassword'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ViewPostComment from './pages/ViewPostComment'
import Profile from './pages/Profile';
import HomeFeed from './pages/HomeFeed';
import Signup from './pages/SignUp';

function App() {
  return (
    <>
     <Router>
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/feed' element={<HomeFeed/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/view/post/:id' element={<ViewPostComment/>}/>
        <Route path='/update/profile' element={<UpdateProfile/>}/>
        <Route path='/update/password' element={<UpdatePassword/>}/>
        <Route path='/password/forgot' element={<ForgotPassword/>}/>
        <Route path='/password/reset/:token' element={<ResetPassword/>}/>

      </Routes>
     </Router>

     <ToastContainer position='bottom-right' theme='dark'/>
    </>
  )
}

export default App