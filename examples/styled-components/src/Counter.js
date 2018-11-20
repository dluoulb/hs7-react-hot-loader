import React from 'react'

class Counter extends React.Component {
  state = { count: 0 }

  componentDidMount() {
    if (!this.props.children) {
      // return;
    }
    // return;
    this.interval = setInterval(
      () => this.setState(prevState => ({ count: prevState.count + 1 })),
      200,
    )
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    return (
      <div>
        #{this.state.count}
        {this.props.children &&
          React.cloneElement(this.props.children, {
            counter: this.state.count,
          })}
      </div>
    )
  }
}

export default Counter
