# public parameters: secp256k1
Zq = GF(0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f)
E  = EllipticCurve(Zq, [0, 7])
G  = E.lift_x(0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798)
p  = G.order()
Zp = GF(p)

def random_oracle(hinput, _table=dict()):
  if hinput not in _table:
    _table[hinput] = Zp.random_element()
  return _table[hinput] 

def verify(message, K, e, s):
  assert random_oracle((K, message)) == e, "random oracle fails"
  assert G * int(s) + X * int(e) == K, "verification equation fails"
  return True

def inner_product(coefficients, values):
  return sum(y*int(x) for x, y in zip(coefficients, values))

# server: generate public key
x = Zp.random_element()
X = G * int(x)

# adversary: open ‘ell‘ sessions
ell = 256

# server: generate commitments
k = [Zp.random_element() for i in range(ell)]
K = [G * int(k_i) for k_i in k]

# adversary: generate challenges
e = [[random_oracle((K_i, b)) for b in range(2)] for K_i in K]
P = ([-sum([Zp(2)^i * e[i][0]/(e[i][1] - e[i][0]) for i in range(ell)])] +
[Zp(2)^i / (e[i][1] - e[i][0]) for i in range(ell)])

forged_K = inner_product(P, [G+X] + K)
forged_message = "message"
forged_e = random_oracle((forged_K, forged_message))
bits = [int(b) for b in bin(forged_e)[2:].rjust(256, '0')][::-1]
chosen_e = [e[i][b] for (i, b) in enumerate(bits)]

# server: generate the responses
s = [k[i] - chosen_e[i]*x for i in range(ell)]

# attacker: generate the forged response
forged_s = inner_product(P, [1] + s)

## check all previous signatures were valid
print(all(
  # l signatures generated honestly
  [verify(m_i, K_i, e_i, s_i) for (m_i, K_i, e_i, s_i) in zip(bits, K, chosen_e, s)] +
  # final signature
  [verify(forged_message, forged_K, forged_e, forged_s)]
))