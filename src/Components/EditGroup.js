import React, {Component} from 'react';
import TimeSum from './TimeSum.js';
import cloneDeep from 'lodash.clonedeep'
import Button from 'react-bootstrap/Button';

class EditGroup extends Component {
  constructor(props) {
    super(props)

    this.state = {
      modalIsOpen: false,
      timers: [],
      groupName: '',
      timerLengthMins: 3,
      timerLengthSecs: 0,
      newTimerName: 'New Timer',
      newTimerLength: ''
    }

    this.addModal = this.addModal.bind(this);
    this.saveGroup = this.saveGroup.bind(this);
    this.addItem = this.addItem.bind(this);
    this.onTextboxChangeGroupName = this.onTextboxChangeGroupName.bind(this);
    this.onTextboxChangeTimerName = this.onTextboxChangeTimerName.bind(this);
    this.onTextboxChangeNewTimerName = this.onTextboxChangeNewTimerName.bind(this);
    this.onTextboxChangeNewTimerLength = this.onTextboxChangeNewTimerLength.bind(this);
    this.onTextboxChangeTimerLengthMins = this.onTextboxChangeTimerLengthMins.bind(this);
  }

  componentDidMount() {
    this.setState({
      timers: this.props.group.timers,
      groupName: this.props.group.name,
      id: this.props.group._id
    })
  }

  onTextboxChangeGroupName(event) {
    this.setState({groupName: event.target.value})
  }

  onTextboxChangeNewTimerName(event) {
    this.setState({
      newTimerName: event.target.value
    })
  }

  onTextboxChangeNewTimerLength(event) {
    if(event.target.value < 60 && event.target.value !== 'e') {
      console.log('hi');
      
      this.setState({
        newTimerLength: event.target.value
      })
    }
  }

  onTextboxChangeTimerName(event, t) {
    let timers = cloneDeep(this.state.timers)
    for (var i = 0; i < timers.length; i++) {
      if(timers[i].id === t.id) {
        timers[i].name = event.target.value
      }
    }
    this.setState({
      timers: timers
    })
  }

  onTextboxChangeTimerLengthMins(event, t) {
    if(event.target.value < 60 && event.target.value !== 'e') {
      let timers = cloneDeep(this.state.timers)
      for (var i = 0; i < timers.length; i++) {
        if(timers[i].id === t.id) {
          timers[i].length = event.target.value * 60
        }
      }
      this.setState({
        timers: timers
      })
    }
  }

    addModal() {
      this.setState({modalIsOpen: true});
    }

    delItem(item) {
      function isTimer(element) {
        if(element.id === item.id) return element;
      }
      let index = this.state.timers.findIndex(isTimer);
      this.state.timers.splice(index, 1);
      let timers = this.state.timers;
      this.setState({
        timers: timers
      })
    }

    addItem() {
      let timers = this.state.timers;
      let newTimer = {
        name: this.state.newTimerName,
        length: this.state.newTimerLength * 60,
        id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8)
      }
      timers.push(newTimer)
      this.setState({
        timers: timers,
        newTimerName: '',
        newTimerLength: ''
      })
    }

    saveGroup(group) {
      const token = JSON.parse(localStorage.the_main_app).token;
      fetch(`https://banana-crumble-42815.herokuapp.com/group?groupId=${this.state.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: this.state.groupName,
          timers: this.state.timers
        })
      }).then(res => res.json()).then(json => {
        if (json.success) {
          this.props.getTimers(token)
          this.props.closeEditModal();
        } else {
          this.setState({timerError: json.message, isLoading: false})
        }
      });
    }

  render() {
    return (
      <div>
        <input type="text" ref={this.groupNameRef} placeholder="Group Name" value={this.state.groupName} onChange={this.onTextboxChangeGroupName}/>
        <div>
          <div>
            {this.state.timers.map(t => {
              return (
                <div key={t.id}>
                  <input type="text" value={t.name} onChange={(e) => this.onTextboxChangeTimerName(e, t)}/>
                  <input type="number" placeholder="Mins" value={this.props.timeFormat(t.length, 'num')[0]} onChange={(e) => this.onTextboxChangeTimerLengthMins(e, t)}/>
                  <Button disabled={this.state.timers.length < 2} onClick={()=>{this.delItem(t)}}>Del</Button>
                </div>
              )
            })}
              <input type="text" placeholder={'name'} value={this.state.newTimerName} onChange={(e) => this.onTextboxChangeNewTimerName(e)}/>
              <input type="number" onChange={(e) => this.onTextboxChangeNewTimerLength(e)} value={this.state.newTimerLength} placeholder="Mins"/>
              <Button disabled={this.state.newTimerLength === ''} onClick={this.addItem}>Add</Button>
          </div>
          <TimeSum timers={this.state.timers}></TimeSum>
          <Button onClick={this.saveGroup}>Save</Button>
        </div>
      </div>
    )
  }

}

export default EditGroup;
