/* 
1. 색상을 선택해서 메모 하나 추가
2. form으로 저장하면 내용 변화
3. 메모 여러개 추가
4. 메모 삭제하기 !!
5. 메모 데이터 보호하기 (클로저, 스코프)
6. 메모 데이터 보존하기 (BOM) --> localStorage, sessionStorage
7. 메모에 외부링크 연결 버튼 만들기
8. LLM을 통한 예시 메시지 생성
*/

async function onload() {
  // Gemini를 통한 예시 메시지 생성
  async function useGemini() {
    const url = "https://ash-honeysuckle-wealth.glitch.me";
    const response = await fetch(url);
    return await response.text();
  }
  document.querySelector("#textInput").value = await useGemini();

  // 랜덤 배경색
  function goodBGColor() {
    return `#${[...Array(3)]
      .map(() => Math.floor(Math.random() * 56) + 200)
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")}`;
  }
  document.querySelector("#colorInput").value = goodBGColor();

  // 메모데이터
  const memoData = [
    ...(JSON.parse(localStorage.getItem("memoStorage")) ?? []),
    ...(JSON.parse(sessionStorage.getItem("memoStorage")) ?? []),
  ];

  // #view에 memo 붙이기
  function drawMemo() {
    // view를 찾아서 div를 만들고 그 안에 memo객체 넣기
    const view = document.querySelector("#view");
    view.innerHTML = ""; // 기존 목록 초기화

    // for (const memo of memoData) {
    for (let i = 0; i < memoData.length; i++) {
      const memoElement = document.createElement("div");
      const memo = memoData[i];
      memoElement.textContent = memo.text;
      memoElement.style.backgroundColor = memo.bgColor;
      view.appendChild(memoElement);

      // 삭제 버튼
      // ✅ 해당 객체 삭제.. 추가시 다시 살아나는 문제가 있음
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "삭제";
      deleteButton.addEventListener("click", () => {
        // memoElement.remove();
        memoData.splice(i, 1); // 배열에서 삭제
        removeFromStorage(memo.id); // 로컬,세션에서 삭제
        drawMemo(); // ui 다시
      });
      memoElement.appendChild(deleteButton);

      // 로컬 저장 버튼
      const localSaveButton = document.createElement("button");
      localSaveButton.textContent = "로컬 저장";
      localSaveButton.addEventListener("click", () => {
        localStorage.setItem(
          "memoStorage",
          JSON.stringify([
            ...(JSON.parse(localStorage.getItem("memoStorage")) ?? []),
            memo,
          ]) // [...parsedData, memo]
        );
      });
      memoElement.appendChild(localSaveButton);

      // 세션 저장 버튼
      const sessionSaveButton = document.createElement("button");
      sessionSaveButton.textContent = "세션 저장";
      sessionSaveButton.addEventListener("click", () => {
        sessionStorage.setItem(
          "memoStorage",
          JSON.stringify([
            ...(JSON.parse(sessionStorage.getItem("memoStorage")) ?? []),
            memo,
          ])
        );
      });
      memoElement.appendChild(sessionSaveButton);

      // 외부 링크 연결 버튼
      if (memo.link) {
        const nowLinkButton = document.createElement("button");
        const newLinkButton = document.createElement("button");
        nowLinkButton.textContent = "현재 창 열기";
        newLinkButton.textContent = "새 창 열기";
        memoElement.appendChild(nowLinkButton);
        memoElement.appendChild(newLinkButton);

        nowLinkButton.addEventListener(
          "click",
          () => (location.href = memo.link)
        );
        newLinkButton.addEventListener("click", () => window.open(memo.link));
      }
    } // end of for
  }

  // 스토리지에서 삭제
  function removeFromStorage(memoId) {
    let localMemos = JSON.parse(localStorage.getItem("memoStorage")) ?? [];
    localMemos = localMemos.filter((m) => m.id !== memoId);
    localStorage.setItem("memoStorage", JSON.stringify(localMemos));

    let sessionMemos = JSON.parse(sessionStorage.getItem("memoStorage")) ?? [];
    sessionMemos = sessionMemos.filter((m) => m.id !== memoId);
    sessionStorage.setItem("memoStorage", JSON.stringify(sessionMemos));
  }

  // form#controller 제어
  const controller = document.querySelector("#controller");
  controller.addEventListener("submit", (event) => {
    event.preventDefault(); // 기본 submit 방지
    // form 데이터 처리
    const form = new FormData(controller);
    const memo = {}; // 임시 객체 생성
    memo.text = form.get("memoText");
    memo.bgColor = form.get("memoBgColor");
    memo.link = form.get("memoLink");
    memo.id = crypto.randomUUID(); // 관리를 위한 id 추가

    memoData.push(memo); // 메모데이터에 push
    drawMemo();
  });

  drawMemo();
}

onload();
