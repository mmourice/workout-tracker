import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(p){ super(p); this.state = { error: null }; }
  static getDerivedStateFromError(error){ return { error }; }
  componentDidCatch(error, info){ console.error("UI crashed:", error, info); }

  render(){
    if (this.state.error) {
      return (
        <div style={{padding:16, color:"#fff"}}>
          <h2>Something went wrong.</h2>
          <p style={{opacity:.8, marginBottom:8}}>If you just updated, try clearing saved data in Settings.</p>
          <pre style={{whiteSpace:"pre-wrap", background:"#00000033", padding:12, borderRadius:12}}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
