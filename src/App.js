import React, { Component } from 'react';
import Particles from 'react-particles-js';
import './App.css';
import Header from './Components/Header';
import Logo from './Components/Logo';
import ImageLinkForm from './Components/ImageLinkForm';
import Rank from './Components/Rank';
import FaceRecognition from './Components/FaceRecognition';
import SignIn from './Signin/Signin';
import Register from './Register/Register'


const particlesOptions = {
  "particles": {
    "number": {
        "value": 100,
        "density": {
            "enable": true,
            "value_area": 800
        }
    },
    "line_linked":{
        "width": 1
    }
},
"interactivity": {
    "detect_on": "window",
    "events": {
        "onhover": {
            "enable": true,
            "mode": "grab"
        }
    }
}
 }

 const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor(){
    super();
    this.state = initialState
    }

  loadUser = (data) => {
    this.setState({user: {  
        id : data.id,
        name : data.name,
        email :data.email,
        entries : data.entries,
        joined : data.joined
    }})
  }

  componentDidMount(){
    fetch('http://localhost:3000')
    .then(response => response.json())
    .then(console.log)
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol : clarifaiFace.left_col * width,
      topRow :clarifaiFace.top_row*height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height+50 - (clarifaiFace.bottom_row * height),
    }
  }

displayFaceBox = (box) => {
  this.setState({box: box});
}

  onInputChange = (event) =>{
    this.setState({input: event.target.value});
  }

  
  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    fetch('https://stark-mesa-25449.herokuapp.com/imageurl',{
        method: 'post',
        headers : { 'Content-Type' : 'application/json'},
        body:JSON.stringify({
          input: this.state.input
        })
       })
      .then(response => response.json()) 
   .then(response =>{
     if(response){
       fetch('https://stark-mesa-25449.herokuapp.com/image',{
        method: 'put',
        headers : { 'Content-Type' : 'application/json'},
        body:JSON.stringify({
          id: this.state.user.id
        })
       })
       .then(response => response.json())
       .then(count => { 
         this.setState(Object.assign(this.state.user,{entries: count}))
       })
       .catch(console.log)
     }
    this.displayFaceBox(this.calculateFaceLocation(response))
   })
   .catch((err) => {
    console.log(err);
   });
   };    
   
onRouteChange = (route) =>{
  if (route === 'signout'){
    this.setState(initialState);
  }
  else if (route === 'home'){
    this.setState({isSignedIn: true});
  }
  this.setState({route :route});
}

  

  render() {
    document.title = 'Smart Brain'
    const { isSignedIn, imageUrl, route, box} = this.state;
    return (
      <div className="App">
        <Particles className='particles'
              params={particlesOptions}
            />
      <Header isSignedIn = {isSignedIn} onRouteChange={this.onRouteChange}/>
      {route === 'home'?
      <div> 
        <Logo/>
        <Rank name= {this.state.user.name} entries = {this.state.user.entries}/>
        <ImageLinkForm 
        onInputChange={this.onInputChange} 
        onButtonSubmit={this.onButtonSubmit}
        />
        <FaceRecognition box={box} imageUrl={imageUrl}/>
      </div>
      : (
        this.state.route === 'signin'?
        <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/> 
        : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
      )}
      <footer>Made with <span style={{color: "#e25555"}}>&#9829;</span> by <a href="https://github.com/shradhaagarwal01" alt="profile link">Shradha Agarwal</a>
        </footer>
  </div>  
);
      } 
    }    

export default App;

