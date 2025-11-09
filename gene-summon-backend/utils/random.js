export function weightedRandomSelect(pool) {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    let randomNum = Math.random() * totalWeight;
  
    for (const item of pool) {
      randomNum -= item.weight;
      if (randomNum <= 0) return item;
    }
  }  