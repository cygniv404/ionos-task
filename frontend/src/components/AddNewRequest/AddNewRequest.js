import React, {Component}  from 'react';

class AddNewRequest extends Component {

  render(){

    return (
        <div className="row">
            <div className="col-md-12">
              <fieldset>
                <legend>New request</legend>
                <form onSubmit={this.props.submitTest.bind(this)}>
                  <div className="row">
                    <div className="col-md-2 form-group">
                      <input type="text" className="form-control" aria-label="requester-input" name="requester" id="requester"
                             placeholder="Requester" value={this.props.requester} onChange={this.props.requesterChanged.bind(this)}/>
                             <p className="error-message">{this.props.requesterError}</p>
                    </div>
                    <div className="col-md-2 form-group">
                      <select className="form-control" aria-label="env-input" name="env_id" id="env_id" placeholder="Environment ID"
                              value={this.props.env}  onChange={this.props.envChanged.bind(this)}>
                        <option value="" defaultValue/>
                        {this.props.assets.test_envs.map((item,i) => <option value={item.id} aria-label={`env#${i}`} key={item.id} >{item.name}</option>)}
                      </select>
                             <p className="error-message">{this.props.envError}</p>
                    </div>
                    <div className="col-md-4 form-group">
                      <select className="form-control" aria-label="testPath-input" name="test_path" id="test_path" multiple
                             placeholder="Test Path" value={this.props.testPath}  onChange={this.props.testPathChanged.bind(this)}>
                        <option value="" defaultValue/>
                        {this.props.assets.available_paths.map((item,i) => <option value={item.id} aria-label={`path#${i}`}  key={item.id}>{item.path}</option>)}
                      </select>
                             <p className="error-message">{this.props.testPathError}</p>
                      <label aria-label="file-input">Upload Test File:</label>
                      <input type="file" className="form-control-file" accept='.py' onChange={this.props.fileUploadChanged.bind(this)}/>
                      {this.props.fileWarnings.map(warn=>(<p className="warning-message">{warn}</p>))}
                      {this.props.fileErrors.map(err=>(<p className="error-message">{err}</p>))}
                      </div>
                    <div className="col-md-2">
                      <input type="submit" aria-label="submit-input"  value="Submit" className="btn btn-primary" disabled={(!this.props.testPath.length && !this.props.file) || this.props.requester === '' || this.props.env === ''}/>
                    </div>
                  </div>
                </form>
              </fieldset>
            </div>
          </div>
    );
  }
}

export default AddNewRequest;