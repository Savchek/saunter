import React, { Component } from 'react'

class Modal extends Component {
  constructor(props) {
    super(props)
    this.state={
      title: '',
      sd: '',
      ld: '',
      newDistant: 0
    }
    this.clearData()
  }

  clearData = () => {
    this.setState({title: '', sd: '', ld: '', newDistant: 0})
    alert('aaa')
  }

  checkSd = () => {
    this.setState({sd: document.getElementById('message-text').value})
    document.getElementById('used').innerHTML = 'Limit ' + this.state.sd.length + ' of 160'
  }

  checkLd = () => {
    this.setState({ld: document.getElementById('long-description').value})
  }

  checkTitle = () => {
    this.setState({title: document.getElementById('recipient-name').value})
  }

  render() {
    return (
      <div className=' modal fade bd-example-modal-lg' tabIndex='-1' role='dialog'>
        <div className=' modal-dialog modal-lg modal-dialog modal-dialog-centered' role='document'>
          <div className=' w-90 h-90 modal-content' >
            <div className='modal-header'>
              <h5 className='modal-title' id='exampleModalCenterTitle'>Add new path</h5>
              <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                <span aria-hidden='true'>&times;</span>
              </button>
            </div>
            <div className='row'>

              <div className='m-0 w-50 modal-body d-flex align-items-center flex-column px-4 border-right border-dark'>
                <form className='w-100 h-100 '>
                  <div className='form-group'>
                    <label className='col-form-label'>Title</label>
                    <input value={this.state.title} onChange={this.checkTitle} type='text' className='form-control' id='recipient-name'/>
                  </div>
                  <div className='form-group'>
                    <label className='col-form-label'>Short description</label>
                    <textarea value={this.state.sd} onChange={this.checkSd} maxLength='160' className='form-control' id='message-text'></textarea>
                    <p style={{marginLeft: '65%'}} id='used'>Limit 0 of 160</p>
                  </div>
                  <div className='form-group'>
                    <label className='col-form-label'>Long description</label>
                    <textarea value={this.state.ld} onChange={this.checkLd} className='form-control' id='long-description'></textarea>
                  </div>
                </form>
                <div className='mx-auto'>Length: <p id='dis'>{this.state.newDistant}</p></div>
                <button onClick={() => this.props.add(this.state.title, this.state.sd, this.state.ld, this.state.newDistant)} type='button' data-dismiss='modal' className='mx-auto btn btn-primary'>Add path</button>
              </div>

              <div className='m-0 px-4 w-50 modal-body d-flex align-items-center flex-column'>
                <div className='w-100 h-100 bg-primary d-flex align-items-center justify-content-center'>
                  <button onClick={() => this.setState({newDistant: this.state.newDistant+100})} type='button' className='btn align-self-baseline btn-secondary mt-2'>Add marker</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
export default Modal