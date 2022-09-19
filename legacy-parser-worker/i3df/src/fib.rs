#![allow(clippy::unreadable_literal)]

// first 70 fibonacci numbers
static FIB_CACHE: &[u64] = &[
    0,
    1,
    1,
    2,
    3,
    5,
    8,
    13,
    21,
    34,
    55,
    89,
    144,
    233,
    377,
    610,
    987,
    1597,
    2584,
    4181,
    6765,
    10946,
    17711,
    28657,
    46368,
    75025,
    121393,
    196418,
    317811,
    514229,
    832040,
    1346269,
    2178309,
    3524578,
    5702887,
    9227465,
    14930352,
    24157817,
    39088169,
    63245986,
    102334155,
    165580141,
    267914296,
    433494437,
    701408733,
    1134903170,
    1836311903,
    2971215073,
    4807526976,
    7778742049,
    12586269025,
    20365011074,
    32951280099,
    53316291173,
    86267571272,
    139583862445,
    225851433717,
    365435296162,
    591286729879,
    956722026041,
    1548008755920,
    2504730781961,
    4052739537881,
    6557470319842,
    10610209857723,
    17167680177565,
    27777890035288,
    44945570212853,
    72723460248141,
    117669030460994,
];

pub fn fib(n: usize) -> u64 {
    if n >= 70 {
        panic!("fib({}) not in table", n);
    }

    FIB_CACHE[n]
}

pub fn decode_fib(data: &[u8], count: usize) -> Vec<u64> {
    let mut array = Vec::with_capacity(count);

    let mut pos = 0;
    for _i in 0..count {
        let mut last_bit = 0;
        let mut n = 0;
        for j in 0.. {
            if j >= 64 {
                panic!("Fibonacci decoding failed ({:?})", array);
            }

            let k = pos + j;
            let bit = (data[k / 8] >> (7 - k % 8)) & 1;

            if bit == 1 && last_bit == 1 {
                pos = k + 1;
                array.push(n - 1);
                break;
            } else if bit == 1 {
                n += fib(2 + j);
            }

            last_bit = bit;
        }
    }

    array
}
