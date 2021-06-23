import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import axios from "./axios-api";
import userEvent from "@testing-library/user-event";

const ENV_COUNT = 100

const setup =  () => {
  const utils = render(<App />)
  const testPathInput = utils.getByLabelText('testPath-input')
  const envInput = utils.getByLabelText('env-input')
  const submitInput = utils.getByLabelText('submit-input')
  const requesterInput = utils.getByLabelText('requester-input')
  const executionTable = utils.getByLabelText('textExecution-table')
  return {
    testPathInput,
    envInput,
    submitInput,
    requesterInput,
    executionTable,
    ...utils,
  }
}

describe('rendering assets into the DOM', () =>{
  test('fetches all test paths', async () => {
    const {testPathInput } = setup()
    expect(testPathInput).toHaveLength(1)
    const assets = await axios.get('assets').then(response => {
      return response.data
    })
    const pathsCount = assets.available_paths.length

    const items = await screen.findAllByLabelText(/path#[0-9]*/)
    expect(items).toHaveLength(pathsCount)

  });

  test('fetches all environments', async () => {
    const { envInput } = setup()
    expect(envInput).toHaveLength(1)
    const items = await screen.findAllByLabelText(/env#[0-9]*/)
    expect(items).toHaveLength(ENV_COUNT)

  });

  test("populates Form & trigger test",  async () => {
    const { envInput, testPathInput, submitInput, requesterInput, executionTable } = setup()

    const env = await screen.findByLabelText('env#0')
    const env1 = await screen.findByLabelText('env#1')
    const env2 = await screen.findByLabelText('env#2')

    const path = await screen.findByLabelText('path#0')
    const path1 = await screen.findByLabelText('path#1')
    const path2 = await screen.findByLabelText('path#2')


    userEvent.selectOptions(envInput, '1');
    await waitFor(() => expect(env.selected).toBeTruthy());
    await waitFor(() => expect(env1.selected).toBeFalsy());
    await waitFor(() => expect(env2.selected).toBeFalsy());

    userEvent.selectOptions(testPathInput, ['8','6','9']);
    await waitFor(() => expect(path.selected).toBeTruthy());
    await waitFor(() => expect(path1.selected).toBeTruthy());
    await waitFor(() => expect(path2.selected).toBeTruthy());

    fireEvent.change(requesterInput, { target: { value: 'tester' } })
    expect(requesterInput.value).toBe('tester')

    expect(submitInput.disabled).toBeFalsy()
    fireEvent.click(submitInput)
    await waitFor(() => expect(executionTable).toHaveTextContent('tester'))

  });
})