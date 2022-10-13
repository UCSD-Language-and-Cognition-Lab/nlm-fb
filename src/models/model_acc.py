import pandas as pd

df = pd.read_csv("data/processed/fb_gpt3-davinci_surprisals_probs.csv")

df["lp_accuracy"] = df["lp_pred"] == df["critical_a"]

print(f"log odds accuracy: {round(df.lp_accuracy.mean(), 3)}")

df[["token_c1", "token_c2", "start_logprob", "end_logprob", "log_odds", "lp_pred", "critical_a", "lp_accuracy"]]

df["tg_n_tokens"] = df.apply(lambda x: 2 if x["pred_t1"] + x["pred_t2"] in ["cupboard", "toolbox"] else 1, axis=1)
df["tg_token"] = df.apply(lambda x: x["pred_t1"] + x["pred_t2"] if x["tg_n_tokens"] == 2 else x["pred_t1"], axis=1)
df["tg_lp"] = df.apply(lambda x: x["pred_lp1"] + x["pred_lp2"] if x["tg_n_tokens"] == 2 else x["pred_lp1"], axis=1)
df["tg_accuracy"] = df["tg_token"] == df["critical_a"]

print(f"token gen accuracy: {round(df.tg_accuracy.mean(), 3)}")

df = pd.read_csv("data/processed/fb_gpt3-text-davinci-002_surprisals_probs.csv")

df["lp_accuracy"] = df["lp_pred"] == df["critical_a"]

print(f"log odds accuracy: {round(df.lp_accuracy.mean(), 3)}")

df[["token_c1", "token_c2", "start_logprob", "end_logprob", "log_odds", "lp_pred", "critical_a", "lp_accuracy"]]

df["tg_n_tokens"] = df.apply(lambda x: 2 if x["pred_t1"] + x["pred_t2"] in ["cupboard", "toolbox"] else 1, axis=1)
df["tg_token"] = df.apply(lambda x: x["pred_t1"] + x["pred_t2"] if x["tg_n_tokens"] == 2 else x["pred_t1"], axis=1)
df["tg_lp"] = df.apply(lambda x: x["pred_lp1"] + x["pred_lp2"] if x["tg_n_tokens"] == 2 else x["pred_lp1"], axis=1)
df["tg_accuracy"] = df["tg_token"] == df["critical_a"]

print(f"token gen accuracy: {round(df.tg_accuracy.mean(), 3)}")