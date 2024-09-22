import torch
import torch.nn.functional as F
from sklearn.metrics import mean_squared_error, accuracy_score, f1_score
from typing import Dict, Any
from nltk.translate.bleu_score import sentence_bleu
from rouge_score import rouge_scorer
from nltk.translate.meteor_score import meteor_score
from pycocoevalcap.cider.cider import Cider
from pycocoevalcap.spice.spice import Spice

def compute_eval_loss(logits, labels):
    predictions = logits.argmax(axis=-1)
    mask = labels != -100
    labels = labels[mask]
    predictions = predictions[mask]
    logits_flat = torch.from_numpy(logits[mask])
    labels_flat = torch.from_numpy(labels)
    loss = F.cross_entropy(logits_flat, labels_flat)
    return {"eval_loss": loss.item()}

def compute_eval_mse(logits, labels):
    mse = mean_squared_error(labels, logits)
    return {"eval_mse": mse}

def compute_eval_accuracy(logits, labels):
    predictions = logits.argmax(axis=-1)
    accuracy = accuracy_score(labels, predictions)
    return {"eval_accuracy": accuracy}

def compute_eval_bleu(logits, labels):
    # BLEU score 계산 로직
    references = [[str(label)] for label in labels]
    candidates = [str(prediction) for prediction in logits.argmax(axis=-1)]
    bleu_scores = [sentence_bleu([ref], cand) for ref, cand in zip(references, candidates)]
    return {"BLEU": sum(bleu_scores) / len(bleu_scores)}

def compute_eval_rouge(logits, labels):
    # ROUGE score 계산 로직
    scorer = rouge_scorer.RougeScorer(['rouge1', 'rougeL'], use_stemmer=True)
    references = [str(label) for label in labels]
    candidates = [str(prediction) for prediction in logits.argmax(axis=-1)]
    rouge_scores = [scorer.score(ref, cand) for ref, cand in zip(references, candidates)]
    avg_rouge1 = sum([score['rouge1'].fmeasure for score in rouge_scores]) / len(rouge_scores)
    avg_rougeL = sum([score['rougeL'].fmeasure for score in rouge_scores]) / len(rouge_scores)
    return {"ROUGE-1": avg_rouge1, "ROUGE-L": avg_rougeL}

def compute_eval_meteor(logits, labels):
    # METEOR score 계산 로직
    references = [str(label) for label in labels]
    candidates = [str(prediction) for prediction in logits.argmax(axis=-1)]
    meteor_scores = [meteor_score([ref], cand) for ref, cand in zip(references, candidates)]
    return {"METEOR": sum(meteor_scores) / len(meteor_scores)}

def compute_eval_cider(logits, labels):
    # CIDEr score 계산 로직
    references = [[str(label)] for label in labels]
    candidates = [str(prediction) for prediction in logits.argmax(axis=-1)]
    cider_scorer = Cider()
    cider_scores, _ = cider_scorer.compute_score(references, candidates)
    return {"CIDEr": cider_scores}

def compute_eval_spice(logits, labels):
    # SPICE score 계산 로직
    references = [[str(label)] for label in labels]
    candidates = [str(prediction) for prediction in logits.argmax(axis=-1)]
    spice_scorer = Spice()
    spice_scores, _ = spice_scorer.compute_score(references, candidates)
    return {"SPICE": spice_scores}

def compute_eval_perplexity(logits, labels):
    # Perplexity 계산 로직
    loss = compute_eval_loss(logits, labels)["eval_loss"]
    perplexity = torch.exp(torch.tensor(loss))
    return {"Perplexity": perplexity.item()}

def compute_eval_f1(logits, labels):
    predictions = logits.argmax(axis=-1)
    f1 = f1_score(labels, predictions, average='weighted')
    return {"F1 Score": f1}

def get_compute_metrics(metrics: list):
    # 선택된 메트릭에 따라 필요한 함수만 호출하도록 설정
    metric_functions = {
        "eval_loss": compute_eval_loss,
        "eval_mse": compute_eval_mse,
        "eval_accuracy": compute_eval_accuracy,
        "BLEU": compute_eval_bleu,
        "ROUGE": compute_eval_rouge,
        "METEOR": compute_eval_meteor,
        "CIDEr": compute_eval_cider,
        "SPICE": compute_eval_spice,
        "Perplexity": compute_eval_perplexity,
        "F1 Score": compute_eval_f1
    }

    selected_metrics = {metric: metric_functions[metric] for metric in metrics if metric in metric_functions}

    def compute_metrics(eval_pred):
        logits, labels = eval_pred.predictions, eval_pred.label_ids
        results = {}
        for metric, func in selected_metrics.items():
            results.update(func(logits, labels))
        return results

    return compute_metrics
