const configuration = {
  // Log level
  logLevel: 'error',

  // Allows using SFC without changes. leading to some components not updated
  pureSFC: false,

  // keep render method unpatched, moving sideEffect to componentWillUpdate
  pureRender: true,

  // Allows SFC to be used, enables "intermediate" components used by Relay, should be disabled for Preact
  allowSFC: true,

  // Disable "hot-replacement-render"
  disableHotRenderer: false,

  // Disable "hot-replacement-render" when injection into react-dom are made
  disableHotRendererWhenInjected: false,

  // Hook on babel component register.
  onComponentRegister: false,

  // Hook on React renders for a first time component
  onComponentCreate: false,
}

export default configuration
