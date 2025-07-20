#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Plotly를 사용한 막대 차트와 원형 차트 예시
"""

import plotly.graph_objects as go
import plotly.express as px
import pandas as  z
import numpy as np

def create_bar_chart():
    """막대 차트 생성 예시"""
    print("막대 차트 생성 중...")
    
    # 샘플 데이터
    categories = ['한식', '중식', '일식', '양식', '분식', '카페']
    values = [25, 18, 15, 22, 12, 8]
    
    # Plotly Express를 사용한 막대 차트
    fig_bar = px.bar(
        x=categories,
        y=values,
        title='음식 카테고리별 선호도',
        labels={'x': '음식 카테고리', 'y': '선호도 (%)'},
        color=values,
        color_continuous_scale='viridis'
    )
    
    fig_bar.update_layout(
        title_font_size=20,
        title_x=0.5,
        xaxis_title_font_size=14,
        yaxis_title_font_size=14
    )
    
    # HTML 파일로 저장
    fig_bar.write_html('bar_chart.html')
    print("막대 차트가 'bar_chart.html' 파일로 저장되었습니다.")
    
    return fig_bar

def create_pie_chart():
    """원형 차트 생성 예시"""
    print("원형 차트 생성 중...")
    
    # 샘플 데이터
    categories = ['한식', '중식', '일식', '양식', '분식', '카페']
    values = [25, 18, 15, 22, 12, 8]
    
    # Plotly Express를 사용한 원형 차트
    fig_pie = px.pie(
        values=values,
        names=categories,
        title='음식 카테고리별 선호도 분포',
        color_discrete_sequence=px.colors.qualitative.Set3
    )
    
    fig_pie.update_layout(
        title_font_size=20,
        title_x=0.5
    )
    
    # HTML 파일로 저장
    fig_pie.write_html('pie_chart.html')
    print("원형 차트가 'pie_chart.html' 파일로 저장되었습니다.")
    
    return fig_pie

def create_advanced_charts():
    """고급 차트 예시"""
    print("고급 차트 생성 중...")
    
    # 월별 매출 데이터
    months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    np.random.seed(42)
    sales = np.random.randint(1000, 5000, 12)
    
    # 월별 매출 막대 차트
    fig_monthly = px.bar(
        x=months,
        y=sales,
        title='월별 매출 현황',
        labels={'x': '월', 'y': '매출 (만원)'},
        color=sales,
        color_continuous_scale='plasma'
    )
    
    fig_monthly.update_layout(
        title_font_size=20,
        title_x=0.5
    )
    
    fig_monthly.write_html('monthly_sales.html')
    print("월별 매출 차트가 'monthly_sales.html' 파일로 저장되었습니다.")
    
    # 분기별 매출 원형 차트
    quarters = ['Q1', 'Q2', 'Q3', 'Q4']
    quarterly_sales = [
        sum(sales[0:3]),   # Q1
        sum(sales[3:6]),   # Q2
        sum(sales[6:9]),   # Q3
        sum(sales[9:12])   # Q4
    ]
    
    fig_quarterly = px.pie(
        values=quarterly_sales,
        names=quarters,
        title='분기별 매출 비율',
        color_discrete_sequence=px.colors.qualitative.Pastel
    )
    
    fig_quarterly.update_layout(
        title_font_size=20,
        title_x=0.5
    )
    
    fig_quarterly.write_html('quarterly_sales.html')
    print("분기별 매출 차트가 'quarterly_sales.html' 파일로 저장되었습니다.")
    
    return fig_monthly, fig_quarterly

def create_interactive_charts():
    """인터랙티브 차트 예시"""
    print("인터랙티브 차트 생성 중...")
    
    categories = ['한식', '중식', '일식', '양식', '분식', '카페']
    values = [25, 18, 15, 22, 12, 8]
    
    # 인터랙티브 막대 차트
    fig_interactive_bar = go.Figure()
    
    fig_interactive_bar.add_trace(go.Bar(
        x=categories,
        y=values,
        text=values,
        textposition='auto',
        hovertemplate='<b>%{x}</b><br>' +
                      '선호도: %{y}%<br>' +
                      '<extra></extra>'
    ))
    
    fig_interactive_bar.update_layout(
        title='인터랙티브 막대 차트 (마우스를 올려보세요)',
        xaxis_title='음식 카테고리',
        yaxis_title='선호도 (%)',
        hovermode='closest'
    )
    
    fig_interactive_bar.write_html('interactive_bar.html')
    print("인터랙티브 막대 차트가 'interactive_bar.html' 파일로 저장되었습니다.")
    
    # 인터랙티브 원형 차트
    fig_interactive_pie = go.Figure()
    
    fig_interactive_pie.add_trace(go.Pie(
        labels=categories,
        values=values,
        textinfo='label+percent',
        textposition='inside',
        hovertemplate='<b>%{label}</b><br>' +
                      '선호도: %{value}%<br>' +
                      '비율: %{percent}<br>' +
                      '<extra></extra>'
    ))
    
    fig_interactive_pie.update_layout(
        title='인터랙티브 원형 차트 (마우스를 올려보세요)',
        showlegend=True
    )
    
    fig_interactive_pie.write_html('interactive_pie.html')
    print("인터랙티브 원형 차트가 'interactive_pie.html' 파일로 저장되었습니다.")
    
    return fig_interactive_bar, fig_interactive_pie

def main():
    """메인 함수"""
    print("Plotly 차트 예시를 생성합니다...")
    print("=" * 50)
    
    # 기본 차트 생성
    create_bar_chart()
    print()
    
    create_pie_chart()
    print()
    
    # 고급 차트 생성
    create_advanced_charts()
    print()
    
    # 인터랙티브 차트 생성
    create_interactive_charts()
    print()
    
    print("모든 차트가 HTML 파일로 저장되었습니다.")
    print("브라우저에서 HTML 파일을 열어 차트를 확인하세요!")

if __name__ == "__main__":
    main() 
    