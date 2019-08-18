import {
  TEST_LOAD,
  TEST_NEW,
  MODEL_ADD,
  MODEL_CLOSE,
  MODEL_CLOSE_ALL,
  MODEL_SELECT,
  MODEL_UPDATE,
  ELEMENT_SELECT,
  ELEMENT_START,
  ELEMENT_UPDATE,
  EXECUTION_CONNECT,
  EXECUTION_DELAY,
  EXECUTION_FAILED,
  EXECUTION_FULFILLED,
  EXECUTION_LOAD,
  EXECUTION_PAUSE,
  EXECUTION_RUN,
  EXECUTION_STEP,
  EXECUTION_STOP
} from "./actionTypes";

export const loadTest = content => {
  return async (dispatch, getState, client) => {
    dispatch({type: EXECUTION_STOP, payload: {response: await client.close()}});
    dispatch({type: TEST_LOAD, payload: {content}});
  }
}

export const newTest = () => {
  modelCount = 0;
  return {
    type: TEST_NEW,
    payload: {
      edges: [],
      generator: "random(edge_coverage(100))",
      id: "e918f0f7-dc56-4aa3-97fb-3660654309f6",
      name: `Untitled-${++modelCount}`,
      startElementId: "",
      vertices: [],
      editor: {
        elements: []
      }
    }
  }
};

let modelCount = 0;
export const addModel = () => ({
  type: MODEL_ADD,
  payload: {
    edges: [],
    generator: "random(edge_coverage(100))",
    id: "e918f0f7-dc56-4aa3-97fb-3660654309f6",
    name: `Untitled-${++modelCount}`,
    startElementId: "",
    vertices: [],
    editor: {
      elements: []
    }
  }
});

export const closeModel = index => ({
  type: MODEL_CLOSE,
  payload: {
    index
  }
});

export const closeAllModels = () => ({
  type: MODEL_CLOSE_ALL,
});

export const selectModel = index => ({
  type: MODEL_SELECT,
  payload: {
    index
  }
});

export const updateModel = (field, event) => ({
  type: MODEL_UPDATE,
  payload: {
    field,
    event
  }
});

export const selectElement = id => ({
  type: ELEMENT_SELECT,
  payload: {
    id
  }
});

export const setStartElement = (event) => ({
  type: ELEMENT_START,
  payload: {
    event
  }
});

export const updateElement = (field, event) => ({
  type: ELEMENT_UPDATE,
  payload: {
    field,
    event
  }
});

export const setExecutionDelay = (value) => ({
  type: EXECUTION_DELAY,
  payload: {
    value
  }
});

const action = (type, response = {}) => {
  return {
    type,
    payload: {
      response
    }
  }
}

export const runTest = () => {
  return async (dispatch, getState, client) => {
    const {test: {models}, execution: {paused, delay}} = getState();
    try {
      if (!paused) {
        dispatch(action(EXECUTION_CONNECT, await client.connect()));
        dispatch(action(EXECUTION_LOAD, await client.send({command: 'start', gw: {name: 'TEST', models}})));
      }
      dispatch(action(EXECUTION_RUN));
      const callback = async () => {
        const { execution: { running, delay }} = getState();
        if (running) {
          await dispatch(stepTest());
          setTimeout(callback, delay);
        }
      }
      setTimeout(callback, delay);
    } catch (error) {
      dispatch(action(EXECUTION_STOP, error));
    }
  }
}

export const stepTest = () => {
  return async (dispatch, getState, client) => {
    try {
      const response = await client.send({command: 'hasNext'});
      if (response.hasNext) {
        dispatch(action(EXECUTION_STEP, await client.send({command: 'getNext'})));
      } else {
        dispatch(action(EXECUTION_FULFILLED, response));
      }
    } catch (error) {
      dispatch(action(EXECUTION_STOP, error));
    }
  }
}

export const pauseTest = () => {
  return async (dispatch, getState, client) => {
    dispatch(action(EXECUTION_PAUSE));
  }
}

export const stopTest = () => {
  return async (dispatch, getState, client) => {
    dispatch(action(EXECUTION_STOP, await client.close()));
  }
}