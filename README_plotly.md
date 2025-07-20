# Plotly 차트 예시

이 프로젝트는 Python Plotly를 사용한 막대 차트와 원형 차트 예시를 포함합니다.

## 설치 방법

### 1. 필요한 라이브러리 설치

```bash
pip install -r requirements.txt
```

또는 개별 설치:

```bash
pip install plotly pandas numpy jupyter notebook
```

## 사용 방법

### 1. Jupyter 노트북 사용

1. Jupyter 노트북 실행:
```bash
jupyter notebook
```

2. `plotly_examples.ipynb` 파일을 열어서 실행

### 2. Python 스크립트 사용

```bash
python plotly_examples.py
```

이 명령어를 실행하면 다음과 같은 HTML 파일들이 생성됩니다:
- `bar_chart.html` - 기본 막대 차트
- `pie_chart.html` - 기본 원형 차트
- `monthly_sales.html` - 월별 매출 막대 차트
- `quarterly_sales.html` - 분기별 매출 원형 차트
- `interactive_bar.html` - 인터랙티브 막대 차트
- `interactive_pie.html` - 인터랙티브 원형 차트

## 포함된 예시

### 1. 기본 막대 차트
- 음식 카테고리별 선호도 데이터
- Plotly Express 사용
- 컬러 그라데이션 적용

### 2. 기본 원형 차트
- 음식 카테고리별 선호도 분포
- Plotly Express 사용
- Set3 컬러 팔레트 적용

### 3. 고급 막대 차트
- Graph Objects 사용
- 더 세밀한 스타일링
- 그리드 라인과 배경 설정

### 4. 도넛 차트
- 원형 차트의 변형
- 중앙에 구멍이 있는 형태
- 인터랙티브 기능 포함

### 5. 실제 데이터 시뮬레이션
- 월별 매출 데이터
- 분기별 매출 비율
- 랜덤 데이터 생성

### 6. 인터랙티브 차트
- 마우스 호버 효과
- 상세한 툴팁
- 동적 상호작용

## 주요 기능

### Plotly Express (px)
- 간단하고 직관적인 API
- 빠른 프로토타이핑에 적합
- 자동 스타일링

### Graph Objects (go)
- 더 세밀한 제어 가능
- 복잡한 차트 생성에 적합
- 완전한 커스터마이징

## 차트 종류

1. **막대 차트 (Bar Chart)**
   - 범주형 데이터 시각화
   - 수량 비교에 적합
   - 수평/수직 방향 지원

2. **원형 차트 (Pie Chart)**
   - 비율 데이터 시각화
   - 전체 대비 부분 표시
   - 도넛 차트 변형 가능

## 인터랙티브 기능

- **호버 효과**: 마우스를 올리면 상세 정보 표시
- **줌 기능**: 차트 확대/축소 가능
- **팬 기능**: 차트 영역 이동 가능
- **다운로드**: PNG, SVG, PDF 등 다양한 형식으로 저장 가능

## 커스터마이징 옵션

### 색상 설정
```python
color_discrete_sequence=px.colors.qualitative.Set3
color_continuous_scale='viridis'
```

### 레이아웃 설정
```python
fig.update_layout(
    title_font_size=20,
    title_x=0.5,
    xaxis_title_font_size=14,
    yaxis_title_font_size=14
)
```

### 호버 템플릿
```python
hovertemplate='<b>%{x}</b><br>값: %{y}<br><extra></extra>'
```

## 파일 구조

```
├── plotly_examples.ipynb      # Jupyter 노트북 예시
├── plotly_examples.py         # Python 스크립트 예시
├── requirements.txt           # 필요한 라이브러리 목록
├── README_plotly.md          # 이 파일
└── *.html                    # 생성되는 차트 파일들
```

## 참고 자료

- [Plotly 공식 문서](https://plotly.com/python/)
- [Plotly Express 가이드](https://plotly.com/python/plotly-express/)
- [Graph Objects 가이드](https://plotly.com/python/graph-objects/) 