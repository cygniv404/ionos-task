import React, {Component} from 'react';

import Aux from '../../hoc/Aux/Aux';
import TestExecutionTable from './../../components/TestExecutionTable/TestExecutionTable';

import axios from './../../axios-api'
import TestItemDetails from "../../components/TestItemDetails/TestItemDetails";
import AddNewRequest from "../../components/AddNewRequest/AddNewRequest";


class IONOSTestExecutor extends Component {
    state = {
        assets: {test_envs: [], available_paths: []},
        error: false,
        items: [],
        detailsView: false,
        itemID: null,
        currentItem: {},
        requesterError: '',
        envError: '',
        testPathError: '',
        requester: '',
        env: '',
        testPath: [],
        file: null,
        fileErrors: [],
        fileWarnings: [],
    };

    interval = null

    componentDidMount() {
        this.getAssets()
        this.interval = setInterval(this.refreshList, 1000);
        this.refreshList()
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    getAssets = () => {
        axios.get('assets').then(response => {
            this.setState({assets: response.data})
        }).catch(error => {
            this.setState({error: true})
        })
    }

    getDisplayPath = (path) => {
        let val = '';
        this.state.assets.available_paths.map(item => {
            if (path.some(i => i === item.id)) {
                val += item.path + ' '
            }
        })
        return val;
    }

    refreshList = () => {
        axios.get('test-run').then(response => {
            let data = response.data;
            this.setState({
                items: data.map(item => {
                    return {displayPath: this.getDisplayPath(item.path), ...item}
                })
            })
        }).catch(error => {
            this.setState({error: true})
        })
        if (this.state.itemID !== null) {
            this.viewItemDetails(this.state.itemID)
        }
    }

    submitTest = (e) => {
        e.preventDefault();
        axios.post('test-run', {
            requested_by: this.state.requester,
            env: this.state.env,
            path: this.state.testPath,
            file: this.state.file
        }).then(response => {
            e.target.reset();

            /* update test paths with the uploaded file*/
            if (this.state.file) {
                this.getAssets();
            }

            this.setState({
                requester: '', env: '', testPath: [], file: null, fileWarnings: [], fileErrors: [],
                requesterError: '', envError: '', testPathError: ''
            })
            this.refreshList()
        }).catch(error => {
            this.setState({
                requesterError: error.response.data.requested_by ?? '',
                envError: error.response.data.env ?? '',
                testPathError: error.response.data.path ?? '',
            })
        })
    }

    viewItemDetails = (itemId) => {
        axios.get('test-run/' + itemId).then(response => {
            let data = response.data
            data.displayPath = this.getDisplayPath(response.data.path)
            this.setState({currentItem: data})
        }).catch(error => {
            this.setState({error: true})
        })
        this.setState({
            detailsView: true,
            itemID: itemId
        })
    };

    backToListItems = () => {
        this.setState({
            detailsView: false,
            itemID: null
        })
    };

    handleTestPathChanged = (e) => {
        let options = e.target.options;
        let value = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        this.setState({testPath: value});
    }

    handleFileUploadChanged = (e) => {
        /* reset errors and warnings from potentially previous input*/
        this.setState({fileErrors: [], fileWarnings: []});

        let file = e.target.files[0];
        let fileName = file.name

        /* dummy validation: file name must start with 'test' */
        if (!fileName.startsWith('test')) {
            this.setState({fileErrors: [...this.state.fileErrors, "File name must start with the world 'test'"]});
            return false;
        }

        /* dummy validation: file size limitation */
        if (file.size > 5000) {
            this.setState({fileErrors: [...this.state.fileErrors, "Please upload a file smaller than 5 MB"]});
            return false;
        }
        /* check name duplication: file name already exists */
        const checkDuplicateFileNamesCount = this.state.assets.available_paths.filter(item => item.path.split('/')[1].indexOf(fileName.split('.')[0]) > -1).length;
        if (checkDuplicateFileNamesCount) {
            fileName = [[fileName.split('.')[0], checkDuplicateFileNamesCount].join('_'), fileName.split('.')[1]].join('.');
            this.setState({fileWarnings: [...this.state.fileWarnings, "file already exists. a new name will be assigned: " + fileName]});
        }

        let reader = new FileReader();
        reader.onload = (function (event) {
            this.setState({file: {name: fileName, data: event.target.result.split(',')[1]}});
        }).bind(this);
        reader.readAsDataURL(file);
    }

    render() {
        if (this.state.detailsView) {
            return (
                <TestItemDetails currentItem={this.state.currentItem} backClicked={this.backToListItems}/>
            )
        }
        return (
            <Aux>
                <AddNewRequest
                    requester={this.state.requester}
                    requesterError={this.state.requesterError}
                    env={this.state.env}
                    envError={this.state.envError}
                    testPath={this.state.testPath}
                    testPathError={this.state.testPathError}
                    fileErrors={this.state.fileErrors}
                    fileWarnings={this.state.fileWarnings}
                    assets={this.state.assets}
                    file={this.state.file}

                    requesterChanged={e => this.setState({requester: e.target.value?.toString()})}
                    envChanged={e => this.setState({env: e.target.value?.toString()})}
                    testPathChanged={this.handleTestPathChanged}
                    fileUploadChanged={this.handleFileUploadChanged}
                    submitTest={this.submitTest}
                />
                <TestExecutionTable items={this.state.items} viewItemDetails={this.viewItemDetails}/>
            </Aux>
        )
    }
}

export default IONOSTestExecutor;