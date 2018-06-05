import React from 'react'
import { cold } from 'react-hot-loader'

class Counter extends React.Component {
  state = { count: 0 }

  componentDidMount() {
    this.interval = setInterval(
      () => this.setState(prevState => ({ count: prevState.count + 1 })),
      200,
    )
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    return <div>#{this.state.count}</div>
  }
}

export default cold(Counter)
//export default Counter;
