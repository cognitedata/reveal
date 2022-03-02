float floatBitsSubset(float inNumber, int fromLeastSignificantBitIndex,  int toMostSignificantBitIndex) {
    float r = float(fromLeastSignificantBitIndex);
    float l = float(toMostSignificantBitIndex);

    float bitShift = pow(2.0, r);
    return mod(((inNumber - mod(inNumber, bitShift)) / bitShift), pow(2.0, l - r));
}

/*

Example:

Get the value from bit 2 to 4 (not inclusive)

input:
inNumber = 173 = 1010_1101 , from=2, to=4

expected output = 1010_|11|01 = 3

1)  subtract any bits in the least significant bit-subset

  mod(inNumber=173, pow(2.0, from=2)) = mod(inNumber, 4) = 1
  
  inNumber - 1 = 172

2)  bitshift such that we remove the least significant bit-subset
    this is guaranteed to be devisible since we subtracted the remainder

  (inNumber=172) / pow(2.0, from=2) = 172 / 4 = 43 = 0010_1011

3)  lastly, remove the most significant bit-subset

  mod((inNumber=43), pow(2.0, to=4 - from=2) = mod(43, 4)

  mod(43, 4) = 3

  or in binary notation: 0000_0011 which is the expected result.

*/ 