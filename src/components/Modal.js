import React, { Component } from 'react'
import { Polyline, Map, Marker } from 'google-maps-react'
import $ from 'jquery'
import './../App.css'

class Modal extends Component {
  state = {
    title: this.props.all.title,
    sd: this.props.all.sd,
    ld: this.props.all.ld,
    distance: this.props.all.distance,
    markers: this.props.all.markers,
    mapCenter: this.props.all.mapCenter
  }

  checkLd = () => this.setState({ld: document.getElementById('long-description').value})

  checkTitle = () => this.setState({title: document.getElementById('recipient-name').value})

  checkSd = () => {
    let sd = document.getElementById('message-text').value
    document.getElementById('used').innerHTML = 'Limit ' + sd.length + ' of 160'
    this.setState({sd})
  }

  hideModal = () => {
    $('#exampleModalCenter').modal('hide')
    this.clearInputs()
  }

  clearInputs = () => {
    document.getElementById('used').innerHTML = 'Limit 0 of 160'
    this.setState({ld: '', sd: '', title: '', distance: 0, markers: []})
  }

  checkAll = () => {
    const title = this.state.title,
          sd = this.state.sd,
          ld = this.state.ld,
          dis = this.state.distance,
          markers = this.state.markers

    if (!title || !sd || !ld || !dis || !markers)
    {
      alert('Заполнены не все поля или расстояние между маркерами не определено')
    } else {
      this.props.addPath(title, sd, ld, dis, markers)
      this.clearInputs()
    }
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

  onMarkerDragEnd = (coord, index) => {
    const { latLng } = coord,
          lat = latLng.lat(),
          lng = latLng.lng()
    let markers = this.state.markers.slice()
    markers[index] = {lat, lng}
    this.setState({markers})
    this.calculateDistance()
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

  drawAddMap = () => {
    let bounds = new this.props.all.google.maps.LatLngBounds()
    for (let i = 0; i < this.state.markers.length; i++) {
      bounds.extend(this.state.markers[i])
    }
    return (
      <Map google={this.props.all.google} initialCenter={this.state.mapCenter} onDragend={this.centerMoved} className='map w-100 h-500px' zoom={4}>
        {this.state.markers.map((marker, index) => <Marker key={index} draggable={true} position={marker} onDragend={(t, map, coord) => this.onMarkerDragEnd(coord, index)}/> )}
        <Polyline path={this.state.markers} geodesic={true} strokeColor='#FF0000' strokeOpacity={0.8} strokeWeight={2}/>
      </Map>
    )
  }

  render() {
    return (
      <div className='modal fade m-auto modal-lg pl-0' id='exampleModalCenter' tabIndex='-1' role='dialog' aria-labelledby='exampleModalCenterTitle' aria-hidden='true'>
          <div className='modal-dialog modal-lg modal-dialog-centered m-0' role='document'>
            <div className='w-100 h-100 modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title' id='exampleModalCenterTitle'>Add new path</h5>
                <button type='button' className='close' onClick={this.hideModal} aria-label='Close'>
                  <span aria-hidden='true'>&times;</span>
                </button>
              </div>
              <div className='row'>
                <div className='m-0 modal-body d-flex align-items-center flex-column px-sm-4 col-sm-6'>
                  <form className='w-100 h-100'>
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
                    <div className='mx-auto d-flex align-items-center flex-row my-4'><p>Length: {this.props.convDis(this.state.distance)}</p></div>
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
    )
  }
}
export default Modal