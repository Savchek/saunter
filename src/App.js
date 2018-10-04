import React, { Component } from 'react'
import { Polyline, Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react'
import $ from 'jquery'
import logo from './images/logo.svg'
import star from './images/star.png'
import arrow from './images/arrow.png'
import search from './images/search.png'
import './App.css'

var firebase = require('firebase/app')
require('firebase/database')
var config = {
  apiKey: 'AIzaSyD_QuNu6mtYes0d98UgkwdJevPEfL9ciMg',
  authDomain: 'test-ddcc2.firebaseapp.com',
  databaseURL: 'https://test-ddcc2.firebaseio.com',
  projectId: 'test-ddcc2',
  storageBucket: 'test-ddcc2.appspot.com',
  messagingSenderId: '708714632451'
}
firebase.initializeApp(config)

class App extends Component {
  state = {
    data: [],
    chosen: -1,
    title: '',
    sd: '',
    ld: '',
    markers: [],
    distance: 0,
    mapCenter: {lat: 52.04976981437028, lng: 32.59525846382917},
    search: ''
  }

  componentDidMount() {
    firebase.database().ref().child('data').on('value', d => {
      const data = d.val()
      if (data){ this.setState({data}) }
    })
  }

  hideModal = () => $('#exampleModalCenter').modal('hide')

  pushChanges = () => firebase.database().ref().child('data').set(this.state.data)

  checkLd = () => this.setState({ld: document.getElementById('long-description').value})

  checkTitle = () => this.setState({title: document.getElementById('recipient-name').value})

  handleKeyUp = () => this.setState({search: document.getElementById('typeSearch').value.toLowerCase()})

  handleClick = index => this.setState({chosen: ++index})

  convDis = dis => dis < 1000 ? dis + ' m' : Math.round(dis/1000) + ' km'

  checkSd = () => {
    let sd = document.getElementById('message-text').value
    document.getElementById('used').innerHTML = 'Limit ' + sd.length + ' of 160'
    this.setState({sd})
  }

  checkActive = index => {
    let styles = 'p-0 list-group-item d-flex justify-content-between align-items-center list-group-item-action cursor-pointer'
    return (this.state.chosen - 1) === index
      ? (styles + ' active')
      : styles
  }

  clearInputs = () => {
    document.getElementById('used').innerHTML = 'Limit 0 of 160'
    this.setState({ld: '', sd: '', title: '', distance: 0, markers: []})
  }

  addPath = (title, sd, ld, dis, data, markers) => {
    data.push({ld, sd, dis, title, fav: false, markers})
    this.setState({chosen: data.length, data})
    this.hideModal()
    this.pushChanges()
  }

  removeItem = () => {
    let data = this.state.data
    data.splice(this.state.chosen-1, 1)
    this.setState({chosen: -1, data})
    this.pushChanges()
  }

  addToFav = () => {
    let data = this.state.data
    data[this.state.chosen-1].fav = data[this.state.chosen-1].fav ? false : true
    this.setState({data, chosen: -1})
    this.pushChanges()
  }

  onMarkerDragEnd = (coord, index) => {
    const { latLng } = coord,
          lat = latLng.lat(),
          lng = latLng.lng()
    let markers = this.state.markers.slice()
    markers[index] = {lat, lng}
    this.setState({markers})
    this.calculateDistance()
  }

  addMarker = () => {
    let markers = this.state.markers.slice()
    markers.push({lat: this.state.mapCenter.lat, lng: this.state.mapCenter.lng})
    this.setState({markers})
    this.calculateDistance()
  }

  centerMoved = (mapProps, map) => {
    const lat = map.center.lat(),
          lng = map.center.lng(),
          mapCenter = {lat: lat, lng: lng}
    this.setState({mapCenter})
  }

  calculateDistance = () => {
    let distance = 0
    for (let i = 0, l = this.state.markers.length; i < l; i++){
      if (this.state.markers[i+1]){
        distance += this.mathDis(this.state.markers[i], this.state.markers[i+1])
      }
    }
    this.setState({distance: Math.round(distance)})
  }

  mathDis = (pointA, pointB) => {
    const lat1 = pointA.lat,
          lng1 = pointA.lng,

          lat2 = pointB.lat,
          lng2 = pointB.lng,

          R = 6371e3,
          φ1 = lat1 * (Math.PI / 180),
          φ2 = lat2 * (Math.PI / 180),
          Δφ = (lat2 - lat1) * (Math.PI / 180),
          Δλ = (lng2 - lng1) * (Math.PI / 180),

          a = (Math.sin(Δφ / 2) * Math.sin(Δφ / 2)) +
                ((Math.cos(φ1) * Math.cos(φ2)) * (Math.sin(Δλ / 2) * Math.sin(Δλ / 2))),
        
          c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),

          distance = R * c

    return distance
  }

  checkAll = () => {
    const title = this.state.title,
          sd = this.state.sd,
          ld = this.state.ld,
          dis = this.state.distance,
          data = this.state.data,
          markers = this.state.markers

    !title || !sd || !ld || !dis || !markers
      ? alert('Заполнены не все поля или расстояние между маркерами не определено')
      : this.addPath(title, sd, ld, dis, data, markers)
  }

  drawMap = () => {
    let bounds = new this.props.google.maps.LatLngBounds(),
        markers = [{}]
    for (let i = 0, l = this.state.markers.length; i < l; i++) {
      bounds.extend(this.state.markers[i])
    }
    if (this.state.chosen >= 0){
      markers = this.state.data[this.state.chosen-1].markers.slice()
    }
    return (
      <Map google={this.props.google} center={markers[0]} className='map w-100 h-100' zoom={18}>
        {markers.map((marker, index) => <Marker key={index} position={marker}/> )}
        <Polyline path={markers} geodesic={true} strokeColor='#FF0000' strokeOpacity={0.8} strokeWeight={2}/>
      </Map>
    )
  }

  drawAddMap = () => {
    let bounds = new this.props.google.maps.LatLngBounds()
    for (let i = 0; i < this.state.markers.length; i++) {
      bounds.extend(this.state.markers[i])
    }
    return (
      <Map google={this.props.google} center={this.state.mapCenter} onDragend={this.centerMoved} className='map w-100 h-500px' zoom={4}>
        {this.state.markers.map((marker, index) => <Marker key={index} draggable={true} position={marker} onDragend={(t, map, coord) => this.onMarkerDragEnd(coord, index)}/> )}
        <Polyline path={this.state.markers} geodesic={true} strokeColor='#FF0000' strokeOpacity={0.8} strokeWeight={2}/>
      </Map>
    )
  }

  renderDescription = () => {
    return this.state.chosen >= 0 && (
      <div className='position-relative h-500px overflow-auto'>
        <div className='p-4 d-flex align-items-end flex-column'>
          <div className='d-flex w-100'>
            <h5>{this.state.data[this.state.chosen-1].title}</h5>
            <h5 className='font-weight-bold ml-auto'>{this.convDis(this.state.data[this.state.chosen-1].dis)}</h5>
          </div>
          <p className='w-100 break-word'>{this.state.data[this.state.chosen-1].ld}</p>
          <div className='h-400px w-100 position-relative mx-auto bg-primary'>
            {this.drawMap()}
          </div>
          <div className='d-flex align-items-end flex-column'>
            <u className='mt-2 text-primary cursor-pointer' onClick={this.addToFav}>
              {this.state.data[this.state.chosen-1].fav ? 'Remove from favorites' : 'Add to favorites'}
            </u>
            <u className='mt-2 text-danger cursor-pointer' onClick={this.removeItem}>Remove item</u>
          </div>
        </div>
      </div>
    )
  }

  renderListItem = () => {
    return (this.state.data.sort((a, b) => a.fav < b.fav ).map((item, index) => {
      const style = this.checkActive(index)
      if (this.state.search === '' || ( item.title.toLowerCase().search(this.state.search)>=0 || item.ld.toLowerCase().search(this.state.search)>=0 ) ) {
        return (
          <a key={index} className={style} onClick={() => this.handleClick(index)}>
            <img className='icon-50' src={logo} alt='logo'/>
            <div className='mb-2 w-70'>
              <div className='mt-2 d-flex flex-row align-items-center'>
                {item.fav && <img className='mb-2 mr-2 icon-20' src={star} alt='fav'/>}
                <h5>{item.title}</h5>
              </div>
              <p className='m-0 p-0 h-100 break-word w-80'>{item.sd}</p>
            </div>
            <h5 className='font-weight-bold ml-auto mr-2 my-0 p-0'>{this.convDis(item.dis)}</h5>
            <img className='icon-30' src={arrow} alt='arrow'/>
          </a>
        )
      }
    }))
  }
  
  render() {
    return (
      <div className='p-4'>
        {/*Modal*/}
        <div className='modal fade m-auto modal-lg pl-0' id='exampleModalCenter' tabIndex='-1' role='dialog' aria-labelledby='exampleModalCenterTitle' aria-hidden='true'>
          <div className='modal-dialog modal-lg modal-dialog-centered m-0' role='document'>
            <div className='w-100 h-100 modal-content' >
              <div className='modal-header'>
                <h5 className='modal-title' id='exampleModalCenterTitle'>Add new path</h5>
                <button type='button' className='close' onClick={this.hideModal} aria-label='Close'>
                  <span aria-hidden='true'>&times;</span>
                </button>
              </div>
              <div className='row'>
                <div className='m-0 modal-body d-flex align-items-center flex-column px-sm-4 col-sm-6'>
                  <form className='w-100 h-100 '>
                    <div className='form-group'>
                      <label className='col-form-label'>Title</label>
                      <input value={this.state.title} onChange={this.checkTitle} type='text' className='form-control' id='recipient-name'/>
                    </div>
                    <div className='form-group'>
                      <label className='col-form-label'>Short description</label>
                      <textarea value={this.state.sd} onChange={this.checkSd} maxLength='160' className='form-control' id='message-text'></textarea>
                      <p className='ml-65p' id='used'>Limit 0 of 160</p>
                    </div>
                    <div className='form-group'>
                      <label className='col-form-label'>Long description</label>
                      <textarea value={this.state.ld} onChange={this.checkLd} className='form-control' id='long-description'></textarea>
                    </div>
                  </form>
                  <div className='mx-auto d-flex align-items-center flex-row my-4'><p>Length: {this.state.distance} m</p></div>
                  <button onClick={this.checkAll} type='button' className='mx-auto btn btn-primary'>Add path</button>
                </div>
                <div className='m-0 px-sm-4 col-sm-6 d-flex align-items-center flex-column'>
                  <button onClick={() => this.addMarker()} type='button' className='btn align-self-baseline btn-secondary mt-2 mx-auto z-index-2'>
                    Add marker
                  </button>
                  {this.drawAddMap()}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*Header*/}
        <div className='d-flex mb-4 align-items-center border-bottom border-dark'>
          <img className='icon-50' src={logo} alt='logo'/>
          <h1 className='m-2'>Saunter</h1>
          <button onClick={this.clearInputs} type='button' data-toggle='modal' data-target='#exampleModalCenter' className='btn btn-primary m-2 ml-auto'>Add path</button>
        </div>
        {/*Main*/}
        <div className='row'>
          {/*First block*/}
          <div className='pr-sm-4 col-sm-6 mb-2'>
            {/*Search bar*/}
            <div className='input-group border border rounded d-flex flex-row mb-3 pr-2'>
              <input onKeyUp={this.handleKeyUp} type='text' id='typeSearch' className='form-control w-90 no-active-border' placeholder='Type to search'/>
              <div className='input-group-append w-10 m-auto'>
                <img className='icon-20' src={search} alt='search'/>
              </div>
            </div>
            <div className='position-relative h-450px overflow-auto'>
              <div className='column'>
                <div className='list-group m-0 p-0' role='tablist'>
                  {this.renderListItem()}
                </div>
              </div>
            </div>
          </div>
          {/*Second block*/}
          <div className='pl-sm-4 col-sm-6'>
            {this.renderDescription()}
          </div>
        </div>
      </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyC-FVQc_gYVE4M2PzMe03OGlrx1-FGrRWE'
})(App)
