import React from 'react'

class Counter extends React.Component {
  state = { count: 0 }

  componentDidMount() {
    this.interval = setInterval(
      () => this.setState(prevState => ({ count: prevState.count + 1 })),
      200,
    )
  }

  componentWillUnmount() {
    console.log('unmount')
    clearInterval(this.interval)
  }

  render() {
    return this.state.count
  }
}

export default Counter
