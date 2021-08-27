export const lerp = (a, b, k) => a + k * (b - a);
export const parseBigNumber = (num) =>
  num
    .slice(2)
    .match(/.{8}/g)
    .map((c) => parseInt(c, 16));

export const int32ToFloat = x => x / 4294967295

export const hexWeiToEth = value => parseInt(value.hex, 16) / 1e18
