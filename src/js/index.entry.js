var React = require('react');
var ReactDOM = require('react-dom');
var yourlib = require('../lib/yourlib');
var fs = require('fs');
var path = require('path');
var template = fs.readFileSync(
    path.resolve(__dirname, '../template/someFile.template'),
    'utf-8'
);
console.log(template);
console.log(yourlib);

class App extends React.Component {
    constructor(props, context) {
        super(props, context);
    }
    render() {
        return <div>Hello World - {template} </div>;
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
