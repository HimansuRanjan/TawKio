import './App.css'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
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
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store/store';
import { useEffect } from 'react';
import { clearAllUserErrors, getUser } from './store/slices/userSlice';
import AddPost from './pages/AddPost';
import UpdatePost from './pages/UpdatePost';
import Messages from './pages/sub-components/Messages';
import Notifications from './pages/sub-components/Notifications';

function App() {

  const dispatch = useDispatch<AppDispatch>();
  // const navigateTo = useNavigate();

  const {isAuthenticated, loading, error} = useSelector(
    (state: RootState) => state.user
  )

  useEffect(()=>{
    dispatch(getUser());
    console.log("App: ", isAuthenticated, error)
    // dispatch()
  },[]);


  return (
    <>
     <Router>
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/feed' element={<HomeFeed/>}/>
        <Route path='/messages' element={<Messages/>}/>
        <Route path='/notifications' element={<Notifications/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/profile/addPost' element={<AddPost/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/view/post/:id' element={<ViewPostComment/>}/>
        <Route path='/post/update/:id' element={<UpdatePost/>}/>
        <Route path='/update/profile' element={<UpdateProfile/>}/>
        <Route path='/update/password' element={<UpdatePassword/>}/>
        <Route path='/password/forgot' element={<ForgotPassword/>}/>
        <Route path='/reset/password/:token' element={<ResetPassword/>}/>

      </Routes>
     </Router>

     <ToastContainer position='bottom-right' theme='dark'/>
    </>
  )
}

export default App