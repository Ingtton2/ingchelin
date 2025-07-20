#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
간단한 Plotly 막대 차트와 원형 차트 예시
"""

import plotly.express as px
import plotly.graph_objects as go

# 샘플 데이터
categories = ['한식', '중식', '일식', '양식', '분식', '카페']
values = [25, 18, 15, 22, 12, 8]

print("=== 간단한 Plotly 예시 ===")

# 1. Plotly Express를 사용한 막대 차트
print("1. 막대 차트 생성...")
fig_bar = px.bar(
    x=categories,
    y=values,
    title='음식 카테고리별 선호도',
    labels={'x': '음식 카테고리', 'y': '선호도 (%)'}
)
fig_bar.show()

# 2. Plotly Express를 사용한 원형 차트
print("2. 원형 차트 생성...")
fig_pie = px.pie(
    values=values,
    names=categories,
    title='음식 카테고리별 선호도 분포'
)
fig_pie.show()

# 3. Graph Objects를 사용한 막대 차트
print("3. Graph Objects 막대 차트 생성...")
fig_go_bar = go.Figure()
fig_go_bar.add_trace(go.Bar(
    x=categories,
    y=values,
    text=values,
    textposition='auto'
))
fig_go_bar.update_layout(
    title='Graph Objects 막대 차트',
    xaxis_title='음식 카테고리',
    yaxis_title='선호도 (%)'
)
fig_go_bar.show()

# 4. Graph Objects를 사용한 원형 차트
print("4. Graph Objects 원형 차트 생성...")
fig_go_pie = go.Figure()
fig_go_pie.add_trace(go.Pie(
    labels=categories,
    values=values,
    textinfo='label+percent'
))
fig_go_pie.update_layout(title='Graph Objects 원형 차트')
fig_go_pie.show()

print("모든 차트가 생성되었습니다!") 