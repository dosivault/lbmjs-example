# Finschia 에서 `LN`(=10^6 cony) 송금 예제

## 실행하기

```bash
npm install
node index.js
```

- **송금에 실패** 할 것임. 예제로 사용된 account들이 `LN`을 보유하고 있지 않기 때문임.
- `LN`을 가진 wallet으로 코드를 수정 필요.
- 기본적으로 Cosmos-SDK기반이기 때문에 [cosmjs](https://cosmos.github.io/cosmjs/)의 패키지를 그대로 사용함 ([참고자료](https://tutorials.cosmos.network/tutorials/7-cosmjs/))
- `main()`을 시작점으로 살펴보기 추천.
