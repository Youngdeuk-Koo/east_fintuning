import axios from 'axios';

export const downloadModel = async (modelName: string, apiToken: string) => {
  return await axios.post('http://localhost:8000/api/v1/download', { 
    model_name: modelName,
    api_token: apiToken || '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'
  });
};

export const getModelDownloadStatus = async (modelName: string) => {
  return await axios.post('http://localhost:8000/api/v1/download_status', { model_name: modelName });
};

export const getModelInfo = async () => {
  return await axios.post('http://localhost:8000/api/v1/model_info');
};

export const unloadModel = async () => {
  return await axios.post('http://localhost:8000/api/v1/unload_model');
};

export const sendMessage = async (inputMessage: string, systemMessage: string, maxNewTokens: number, useGPU: boolean, useFP16: boolean, useAutocast: boolean, useGradientCheckpointing: boolean, temperature: number, topP: number, topK: number, repetitionPenalty: number, seed: number | null) => {
  return await fetch('http://localhost:8000/api/v1/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input_text: inputMessage,
      system_message: systemMessage,
      max_new_tokens: maxNewTokens,
      use_gpu: useGPU,
      use_fp16: useFP16,
      use_autocast: useAutocast,
      use_gradient_checkpointing: useGradientCheckpointing,
      temperature: temperature,
      top_p: topP,
      top_k: topK,
      repetition_penalty: repetitionPenalty,
      seed: seed !== null ? seed : undefined,
    }),
  });
};

export const getGpuMemoryInfo = async () => {
  return await axios.get('http://localhost:8000/api/v1/gpu_memory_info');
};