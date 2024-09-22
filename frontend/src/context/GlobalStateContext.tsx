import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface GlobalState {
    model: any;
    setModel: React.Dispatch<React.SetStateAction<any>>;
    tokenizer: any;
    setTokenizer: React.Dispatch<React.SetStateAction<any>>;
    modelName: string | null;
    setModelName: React.Dispatch<React.SetStateAction<string | null>>;
    messages: { text: string, isUser: boolean }[];
    setMessages: React.Dispatch<React.SetStateAction<{ text: string, isUser: boolean }[]>>;
    modelLoaded: boolean;
    setModelLoaded: React.Dispatch<React.SetStateAction<boolean>>;
    apiToken: string;
    setApiToken: React.Dispatch<React.SetStateAction<string>>;
    showApiTokenInput: boolean;
    setShowApiTokenInput: React.Dispatch<React.SetStateAction<boolean>>;
    modelInfo: string;
    setModelInfo: React.Dispatch<React.SetStateAction<string>>;
    tokenizerInfo: string;
    setTokenizerInfo: React.Dispatch<React.SetStateAction<string>>;
    systemMessage: string;
    setSystemMessage: React.Dispatch<React.SetStateAction<string>>;
    useGPU: boolean;
    setUseGPU: React.Dispatch<React.SetStateAction<boolean>>;
    useFP16: boolean;
    setUseFP16: React.Dispatch<React.SetStateAction<boolean>>;
    useAutocast: boolean;
    setUseAutocast: React.Dispatch<React.SetStateAction<boolean>>;
    useGradientCheckpointing: boolean;
    setUseGradientCheckpointing: React.Dispatch<React.SetStateAction<boolean>>;
    maxNewTokens: number;
    setMaxNewTokens: React.Dispatch<React.SetStateAction<number>>;
    temperature: number;
    setTemperature: React.Dispatch<React.SetStateAction<number>>;
    topP: number;
    setTopP: React.Dispatch<React.SetStateAction<number>>;
    topK: number;
    setTopK: React.Dispatch<React.SetStateAction<number>>;
    repetitionPenalty: number;
    setRepetitionPenalty: React.Dispatch<React.SetStateAction<number>>;
    seed: number | null;
    setSeed: React.Dispatch<React.SetStateAction<number | null>>;
    chatInfo: any;
    setChatInfo: React.Dispatch<React.SetStateAction<any>>;
    gpuMemoryInfo: any;
    setGpuMemoryInfo: React.Dispatch<React.SetStateAction<any>>;
    taskStatus: string | null;
    setTaskStatus: React.Dispatch<React.SetStateAction<string | null>>;
    taskId: string | null;
    setTaskId: React.Dispatch<React.SetStateAction<string | null>>;
    modelAlias: string;
    setModelAlias: React.Dispatch<React.SetStateAction<string>>;
    modelSize: string;
    setModelSize: React.Dispatch<React.SetStateAction<string>>;
    mainProjectName: string;
    setMainProjectName: React.Dispatch<React.SetStateAction<string>>;
    subProjectName: string;
    setSubProjectName: React.Dispatch<React.SetStateAction<string>>;
    workerName: string;
    setWorkerName: React.Dispatch<React.SetStateAction<string>>;
    usePeft: boolean;
    setUsePeft: React.Dispatch<React.SetStateAction<boolean>>;
    useDeepSpeed: boolean;
    setUseDeepSpeed: React.Dispatch<React.SetStateAction<boolean>>;
    useQuantization: boolean;
    setUseQuantization: React.Dispatch<React.SetStateAction<boolean>>;
    useHF: boolean;
    setUseHF: React.Dispatch<React.SetStateAction<boolean>>;
    useWandB: boolean;
    setUseWandB: React.Dispatch<React.SetStateAction<boolean>>;
    metrics: string[];
    setMetrics: React.Dispatch<React.SetStateAction<string[]>>;
    trainResult: any;
    setTrainResult: React.Dispatch<React.SetStateAction<any>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    peftSettingsVisible: boolean;
    setPeftSettingsVisible: React.Dispatch<React.SetStateAction<boolean>>;
    deepspeedSettingsVisible: boolean;
    setDeepspeedSettingsVisible: React.Dispatch<React.SetStateAction<boolean>>;
    quantizationSettingsVisible: boolean;
    setQuantizationSettingsVisible: React.Dispatch<React.SetStateAction<boolean>>;
    trainingArgsVisible: boolean;
    setTrainingArgsVisible: React.Dispatch<React.SetStateAction<boolean>>;
    hfSettingsVisible: boolean;
    setHfSettingsVisible: React.Dispatch<React.SetStateAction<boolean>>;
    wandbSettingsVisible: boolean;
    setWandbSettingsVisible: React.Dispatch<React.SetStateAction<boolean>>;
    reportTo: string;
    setReportTo: React.Dispatch<React.SetStateAction<string>>;
    hfUsername: string;
    setHfUsername: React.Dispatch<React.SetStateAction<string>>;
    hfToken: string;
    setHfToken: React.Dispatch<React.SetStateAction<string>>;
    wandbToken: string;
    setWandbToken: React.Dispatch<React.SetStateAction<string>>;
    advancedSettings: any;
    setAdvancedSettings: React.Dispatch<React.SetStateAction<any>>;
}

interface GlobalStateProviderProps {
    children: ReactNode;
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({ children }) => {
    const [model, setModel] = useState<any>(null);
    const [tokenizer, setTokenizer] = useState<any>(null);
    const [modelName, setModelName] = useState<string | null>(null);
    const [messages, setMessages] = useState<{ text: string, isUser: boolean }[]>([]);
    const [modelLoaded, setModelLoaded] = useState<boolean>(false);
    const [apiToken, setApiToken] = useState<string>('');
    const [showApiTokenInput, setShowApiTokenInput] = useState<boolean>(false);
    const [modelInfo, setModelInfo] = useState<string>('');
    const [tokenizerInfo, setTokenizerInfo] = useState<string>('');
    const [systemMessage, setSystemMessage] = useState<string>('');
    const [useGPU, setUseGPU] = useState<boolean>(false);
    const [useFP16, setUseFP16] = useState<boolean>(false);
    const [useAutocast, setUseAutocast] = useState<boolean>(false);
    const [useGradientCheckpointing, setUseGradientCheckpointing] = useState<boolean>(false);
    const [maxNewTokens, setMaxNewTokens] = useState<number>(0);
    const [temperature, setTemperature] = useState<number>(0);
    const [topP, setTopP] = useState<number>(0);
    const [topK, setTopK] = useState<number>(0);
    const [repetitionPenalty, setRepetitionPenalty] = useState<number>(0);
    const [seed, setSeed] = useState<number | null>(null);
    const [chatInfo, setChatInfo] = useState<any>(null);
    const [gpuMemoryInfo, setGpuMemoryInfo] = useState<any>(null);
    const [taskStatus, setTaskStatus] = useState<string | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [modelAlias, setModelAlias] = useState<string>('');
    const [modelSize, setModelSize] = useState<string>('');
    const [mainProjectName, setMainProjectName] = useState<string>('');
    const [subProjectName, setSubProjectName] = useState<string>('');
    const [workerName, setWorkerName] = useState<string>('');
    const [usePeft, setUsePeft] = useState<boolean>(false);
    const [useDeepSpeed, setUseDeepSpeed] = useState<boolean>(false);
    const [useQuantization, setUseQuantization] = useState<boolean>(false);
    const [useHF, setUseHF] = useState<boolean>(false);
    const [useWandB, setUseWandB] = useState<boolean>(false);
    const [metrics, setMetrics] = useState<string[]>([]);
    const [trainResult, setTrainResult] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [peftSettingsVisible, setPeftSettingsVisible] = useState<boolean>(false);
    const [deepspeedSettingsVisible, setDeepspeedSettingsVisible] = useState<boolean>(false);
    const [quantizationSettingsVisible, setQuantizationSettingsVisible] = useState<boolean>(false);
    const [trainingArgsVisible, setTrainingArgsVisible] = useState<boolean>(false);
    const [hfSettingsVisible, setHfSettingsVisible] = useState<boolean>(false);
    const [wandbSettingsVisible, setWandbSettingsVisible] = useState<boolean>(false);
    const [reportTo, setReportTo] = useState<string>('');
    const [hfUsername, setHfUsername] = useState<string>('');
    const [hfToken, setHfToken] = useState<string>('');
    const [wandbToken, setWandbToken] = useState<string>('');
    const [advancedSettings, setAdvancedSettings] = useState<any>({});

    // Load state from local storage on mount
    useEffect(() => {
        const savedModel = localStorage.getItem('model');
        const savedTokenizer = localStorage.getItem('tokenizer');
        const savedModelName = localStorage.getItem('modelName');
        const savedMessages = localStorage.getItem('messages');
        const savedModelLoaded = localStorage.getItem('modelLoaded');
        const savedApiToken = localStorage.getItem('apiToken');
        const savedShowApiTokenInput = localStorage.getItem('showApiTokenInput');
        const savedModelInfo = localStorage.getItem('modelInfo');
        const savedTokenizerInfo = localStorage.getItem('tokenizerInfo');
        const savedSystemMessage = localStorage.getItem('systemMessage');
        const savedUseGPU = localStorage.getItem('useGPU');
        const savedUseFP16 = localStorage.getItem('useFP16');
        const savedUseAutocast = localStorage.getItem('useAutocast');
        const savedUseGradientCheckpointing = localStorage.getItem('useGradientCheckpointing');
        const savedMaxNewTokens = localStorage.getItem('maxNewTokens');
        const savedTemperature = localStorage.getItem('temperature');
        const savedTopP = localStorage.getItem('topP');
        const savedTopK = localStorage.getItem('topK');
        const savedRepetitionPenalty = localStorage.getItem('repetitionPenalty');
        const savedSeed = localStorage.getItem('seed');
        const savedChatInfo = localStorage.getItem('chatInfo');
        const savedGpuMemoryInfo = localStorage.getItem('gpuMemoryInfo');
        const savedTaskStatus = localStorage.getItem('taskStatus');
        const savedTaskId = localStorage.getItem('taskId');
        const savedModelAlias = localStorage.getItem('modelAlias');
        const savedModelSize = localStorage.getItem('modelSize');
        const savedMainProjectName = localStorage.getItem('mainProjectName');
        const savedSubProjectName = localStorage.getItem('subProjectName');
        const savedWorkerName = localStorage.getItem('workerName');
        const savedUsePeft = localStorage.getItem('usePeft');
        const savedUseDeepSpeed = localStorage.getItem('useDeepSpeed');
        const savedUseQuantization = localStorage.getItem('useQuantization');
        const savedUseHF = localStorage.getItem('useHF');
        const savedUseWandB = localStorage.getItem('useWandB');
        const savedMetrics = localStorage.getItem('metrics');
        const savedTrainResult = localStorage.getItem('trainResult');
        const savedLoading = localStorage.getItem('loading');
        const savedPeftSettingsVisible = localStorage.getItem('peftSettingsVisible');
        const savedDeepspeedSettingsVisible = localStorage.getItem('deepspeedSettingsVisible');
        const savedQuantizationSettingsVisible = localStorage.getItem('quantizationSettingsVisible');
        const savedTrainingArgsVisible = localStorage.getItem('trainingArgsVisible');
        const savedHfSettingsVisible = localStorage.getItem('hfSettingsVisible');
        const savedWandbSettingsVisible = localStorage.getItem('wandbSettingsVisible');
        const savedReportTo = localStorage.getItem('reportTo');
        const savedHfUsername = localStorage.getItem('hfUsername');
        const savedHfToken = localStorage.getItem('hfToken');
        const savedWandbToken = localStorage.getItem('wandbToken');
        const savedAdvancedSettings = localStorage.getItem('advancedSettings');

        if (savedModel) setModel(JSON.parse(savedModel));
        if (savedTokenizer) setTokenizer(JSON.parse(savedTokenizer));
        if (savedModelName) setModelName(savedModelName);
        if (savedMessages) setMessages(JSON.parse(savedMessages));
        if (savedModelLoaded) setModelLoaded(JSON.parse(savedModelLoaded));
        if (savedApiToken) setApiToken(savedApiToken);
        if (savedShowApiTokenInput) setShowApiTokenInput(JSON.parse(savedShowApiTokenInput));
        if (savedModelInfo) setModelInfo(savedModelInfo);
        if (savedTokenizerInfo) setTokenizerInfo(savedTokenizerInfo);
        if (savedSystemMessage) setSystemMessage(savedSystemMessage);
        if (savedUseGPU) setUseGPU(JSON.parse(savedUseGPU));
        if (savedUseFP16) setUseFP16(JSON.parse(savedUseFP16));
        if (savedUseAutocast) setUseAutocast(JSON.parse(savedUseAutocast));
        if (savedUseGradientCheckpointing) setUseGradientCheckpointing(JSON.parse(savedUseGradientCheckpointing));
        if (savedMaxNewTokens) setMaxNewTokens(JSON.parse(savedMaxNewTokens));
        if (savedTemperature) setTemperature(JSON.parse(savedTemperature));
        if (savedTopP) setTopP(JSON.parse(savedTopP));
        if (savedTopK) setTopK(JSON.parse(savedTopK));
        if (savedRepetitionPenalty) setRepetitionPenalty(JSON.parse(savedRepetitionPenalty));
        if (savedSeed) setSeed(JSON.parse(savedSeed));
        if (savedChatInfo) setChatInfo(JSON.parse(savedChatInfo));
        if (savedGpuMemoryInfo) setGpuMemoryInfo(JSON.parse(savedGpuMemoryInfo));
        if (savedTaskStatus) setTaskStatus(savedTaskStatus);
        if (savedTaskId) setTaskId(savedTaskId);
        if (savedModelAlias) setModelAlias(savedModelAlias);
        if (savedModelSize) setModelSize(savedModelSize);
        if (savedMainProjectName) setMainProjectName(savedMainProjectName);
        if (savedSubProjectName) setSubProjectName(savedSubProjectName);
        if (savedWorkerName) setWorkerName(savedWorkerName);
        if (savedUsePeft) setUsePeft(JSON.parse(savedUsePeft));
        if (savedUseDeepSpeed) setUseDeepSpeed(JSON.parse(savedUseDeepSpeed));
        if (savedUseQuantization) setUseQuantization(JSON.parse(savedUseQuantization));
        if (savedUseHF) setUseHF(JSON.parse(savedUseHF));
        if (savedUseWandB) setUseWandB(JSON.parse(savedUseWandB));
        if (savedMetrics) setMetrics(JSON.parse(savedMetrics));
        if (savedTrainResult) setTrainResult(JSON.parse(savedTrainResult));
        if (savedLoading) setLoading(JSON.parse(savedLoading));
        if (savedPeftSettingsVisible) setPeftSettingsVisible(JSON.parse(savedPeftSettingsVisible));
        if (savedDeepspeedSettingsVisible) setDeepspeedSettingsVisible(JSON.parse(savedDeepspeedSettingsVisible));
        if (savedQuantizationSettingsVisible) setQuantizationSettingsVisible(JSON.parse(savedQuantizationSettingsVisible));
        if (savedTrainingArgsVisible) setTrainingArgsVisible(JSON.parse(savedTrainingArgsVisible));
        if (savedHfSettingsVisible) setHfSettingsVisible(JSON.parse(savedHfSettingsVisible));
        if (savedWandbSettingsVisible) setWandbSettingsVisible(JSON.parse(savedWandbSettingsVisible));
        if (savedReportTo) setReportTo(savedReportTo);
        if (savedHfUsername) setHfUsername(savedHfUsername);
        if (savedHfToken) setHfToken(savedHfToken);
        if (savedWandbToken) setWandbToken(savedWandbToken);
        if (savedAdvancedSettings) setAdvancedSettings(JSON.parse(savedAdvancedSettings));
    }, []);

    // Save state to local storage on change
    useEffect(() => {
        localStorage.setItem('model', JSON.stringify(model));
    }, [model]);

    useEffect(() => {
        localStorage.setItem('tokenizer', JSON.stringify(tokenizer));
    }, [tokenizer]);

    useEffect(() => {
        localStorage.setItem('modelName', modelName || '');
    }, [modelName]);

    useEffect(() => {
        localStorage.setItem('messages', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        localStorage.setItem('modelLoaded', JSON.stringify(modelLoaded));
    }, [modelLoaded]);

    useEffect(() => {
        localStorage.setItem('apiToken', apiToken);
    }, [apiToken]);

    useEffect(() => {
        localStorage.setItem('showApiTokenInput', JSON.stringify(showApiTokenInput));
    }, [showApiTokenInput]);

    useEffect(() => {
        localStorage.setItem('modelInfo', modelInfo);
    }, [modelInfo]);

    useEffect(() => {
        localStorage.setItem('tokenizerInfo', tokenizerInfo);
    }, [tokenizerInfo]);

    useEffect(() => {
        localStorage.setItem('systemMessage', systemMessage);
    }, [systemMessage]);

    useEffect(() => {
        localStorage.setItem('useGPU', JSON.stringify(useGPU));
    }, [useGPU]);

    useEffect(() => {
        localStorage.setItem('useFP16', JSON.stringify(useFP16));
    }, [useFP16]);

    useEffect(() => {
        localStorage.setItem('useAutocast', JSON.stringify(useAutocast));
    }, [useAutocast]);

    useEffect(() => {
        localStorage.setItem('useGradientCheckpointing', JSON.stringify(useGradientCheckpointing));
    }, [useGradientCheckpointing]);

    useEffect(() => {
        localStorage.setItem('maxNewTokens', JSON.stringify(maxNewTokens));
    }, [maxNewTokens]);

    useEffect(() => {
        localStorage.setItem('temperature', JSON.stringify(temperature));
    }, [temperature]);

    useEffect(() => {
      localStorage.setItem('topP', JSON.stringify(topP));
  }, [topP]);

  useEffect(() => {
      localStorage.setItem('topK', JSON.stringify(topK));
  }, [topK]);

  useEffect(() => {
      localStorage.setItem('repetitionPenalty', JSON.stringify(repetitionPenalty));
  }, [repetitionPenalty]);

  useEffect(() => {
      localStorage.setItem('seed', JSON.stringify(seed));
  }, [seed]);

  useEffect(() => {
      localStorage.setItem('chatInfo', JSON.stringify(chatInfo));
  }, [chatInfo]);

  useEffect(() => {
      localStorage.setItem('gpuMemoryInfo', JSON.stringify(gpuMemoryInfo));
  }, [gpuMemoryInfo]);

  useEffect(() => {
      localStorage.setItem('taskStatus', taskStatus || '');
  }, [taskStatus]);

  useEffect(() => {
      localStorage.setItem('taskId', taskId || '');
  }, [taskId]);

  useEffect(() => {
      localStorage.setItem('modelAlias', modelAlias);
  }, [modelAlias]);

  useEffect(() => {
      localStorage.setItem('modelSize', modelSize);
  }, [modelSize]);

  useEffect(() => {
      localStorage.setItem('mainProjectName', mainProjectName);
  }, [mainProjectName]);

  useEffect(() => {
      localStorage.setItem('subProjectName', subProjectName);
  }, [subProjectName]);

  useEffect(() => {
      localStorage.setItem('workerName', workerName);
  }, [workerName]);

  useEffect(() => {
      localStorage.setItem('usePeft', JSON.stringify(usePeft));
  }, [usePeft]);

  useEffect(() => {
      localStorage.setItem('useDeepSpeed', JSON.stringify(useDeepSpeed));
  }, [useDeepSpeed]);

  useEffect(() => {
      localStorage.setItem('useQuantization', JSON.stringify(useQuantization));
  }, [useQuantization]);

  useEffect(() => {
      localStorage.setItem('useHF', JSON.stringify(useHF));
  }, [useHF]);

  useEffect(() => {
      localStorage.setItem('useWandB', JSON.stringify(useWandB));
  }, [useWandB]);

  useEffect(() => {
      localStorage.setItem('metrics', JSON.stringify(metrics));
  }, [metrics]);

  useEffect(() => {
      localStorage.setItem('trainResult', JSON.stringify(trainResult));
  }, [trainResult]);

  useEffect(() => {
      localStorage.setItem('loading', JSON.stringify(loading));
  }, [loading]);

  useEffect(() => {
      localStorage.setItem('peftSettingsVisible', JSON.stringify(peftSettingsVisible));
  }, [peftSettingsVisible]);

  useEffect(() => {
      localStorage.setItem('deepspeedSettingsVisible', JSON.stringify(deepspeedSettingsVisible));
  }, [deepspeedSettingsVisible]);

  useEffect(() => {
      localStorage.setItem('quantizationSettingsVisible', JSON.stringify(quantizationSettingsVisible));
  }, [quantizationSettingsVisible]);

  useEffect(() => {
      localStorage.setItem('trainingArgsVisible', JSON.stringify(trainingArgsVisible));
  }, [trainingArgsVisible]);

  useEffect(() => {
      localStorage.setItem('hfSettingsVisible', JSON.stringify(hfSettingsVisible));
  }, [hfSettingsVisible]);

  useEffect(() => {
      localStorage.setItem('wandbSettingsVisible', JSON.stringify(wandbSettingsVisible));
  }, [wandbSettingsVisible]);

  useEffect(() => {
      localStorage.setItem('reportTo', reportTo);
  }, [reportTo]);

  useEffect(() => {
      localStorage.setItem('hfUsername', hfUsername);
  }, [hfUsername]);

  useEffect(() => {
      localStorage.setItem('hfToken', hfToken);
  }, [hfToken]);

  useEffect(() => {
      localStorage.setItem('wandbToken', wandbToken);
  }, [wandbToken]);

  useEffect(() => {
      localStorage.setItem('advancedSettings', JSON.stringify(advancedSettings));
  }, [advancedSettings]);

  return (
      <GlobalStateContext.Provider value={{
          model, setModel, tokenizer, setTokenizer, modelName, setModelName, messages, setMessages, modelLoaded, setModelLoaded,
          apiToken, setApiToken, showApiTokenInput, setShowApiTokenInput, modelInfo, setModelInfo, tokenizerInfo, setTokenizerInfo,
          systemMessage, setSystemMessage, useGPU, setUseGPU, useFP16, setUseFP16, useAutocast, setUseAutocast, useGradientCheckpointing, setUseGradientCheckpointing,
          maxNewTokens, setMaxNewTokens, temperature, setTemperature, topP, setTopP, topK, setTopK, repetitionPenalty, setRepetitionPenalty, seed, setSeed,
          chatInfo, setChatInfo, gpuMemoryInfo, setGpuMemoryInfo, taskStatus, setTaskStatus, taskId, setTaskId, modelAlias, setModelAlias, modelSize, setModelSize,
          mainProjectName, setMainProjectName, subProjectName, setSubProjectName, workerName, setWorkerName, usePeft, setUsePeft, useDeepSpeed, setUseDeepSpeed,
          useQuantization, setUseQuantization, useHF, setUseHF, useWandB, setUseWandB, metrics, setMetrics, trainResult, setTrainResult, loading, setLoading,
          peftSettingsVisible, setPeftSettingsVisible, deepspeedSettingsVisible, setDeepspeedSettingsVisible, quantizationSettingsVisible, setQuantizationSettingsVisible,
          trainingArgsVisible, setTrainingArgsVisible, hfSettingsVisible, setHfSettingsVisible, wandbSettingsVisible, setWandbSettingsVisible, reportTo, setReportTo,
          hfUsername, setHfUsername, hfToken, setHfToken, wandbToken, setWandbToken, advancedSettings, setAdvancedSettings
      }}>
          {children}
      </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
      throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};