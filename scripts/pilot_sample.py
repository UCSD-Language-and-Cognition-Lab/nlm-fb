import random

import pandas as pd

items = []

for i in range(1, 13):
    c1, c2 = random.sample(["tb", "fb"], k=2)
    f1, f2 = random.sample(["s", "e"], k=2)
    r1, r2 = random.sample(["s", "e"], k=2)
    k1, k2 = random.sample(["im", "ex"], k=2)

    items.append(f"{i}_{c1}_1_{f1}_{r1}_{k1}")
    items.append(f"{i}_{c2}_1_{f2}_{r2}_{k2}")

df = pd.DataFrame({"item_id": items})
df.to_csv("nlm_fb/data/mturk_pilot_items.csv", index=False)
