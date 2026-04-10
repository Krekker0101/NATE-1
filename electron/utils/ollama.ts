export interface OllamaTagModel {
  name?: string;
  remote_model?: string;
  remote_host?: string;
  size?: number;
}

export interface OllamaModelEntry {
  name?: string;
  description?: string;
  remote_model?: string;
  remote_host?: string;
  size?: number;
  tags?: string[];
}

const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434';

export const normalizeOllamaUrl = (url?: string): string => {
  const trimmed = (url || DEFAULT_OLLAMA_URL).trim().replace(/\/+$/, '');

  if (!trimmed) {
    return DEFAULT_OLLAMA_URL;
  }

  return trimmed
    .replace(/^http:\/\/localhost(?=[:/]|$)/i, 'http://127.0.0.1')
    .replace(/^https:\/\/localhost(?=[:/]|$)/i, 'https://127.0.0.1')
    .replace(/\[::1\]/gi, '127.0.0.1');
};

export const isLocalOllamaModel = (model: OllamaTagModel | OllamaModelEntry | null | undefined): boolean => {
  if (!model?.name) return false;
  if ((model as OllamaModelEntry).remote_model || (model as OllamaModelEntry).remote_host) return false;
  if (/-cloud$/i.test(model.name)) return false;
  return true;
};

const extractModelNames = (models: Array<OllamaTagModel | OllamaModelEntry>): string[] => {
  const unique = new Set<string>();
  for (const model of models) {
    if (!isLocalOllamaModel(model)) continue;
    const name = model.name?.trim();
    if (name) {
      unique.add(name);
    }
  }
  return Array.from(unique);
};

export const extractLocalOllamaModelNames = (payload: unknown): string[] => {
  if (!payload || typeof payload !== 'object') return [];

  const payloadObj = payload as Record<string, unknown>;

  if (Array.isArray(payloadObj.models)) {
    return extractModelNames(payloadObj.models as Array<OllamaTagModel | OllamaModelEntry>);
  }

  if (Array.isArray(payloadObj.tags)) {
    return extractModelNames(payloadObj.tags as Array<OllamaTagModel | OllamaModelEntry>);
  }

  return [];
};
