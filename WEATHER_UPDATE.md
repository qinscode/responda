# 天气站数据更新说明

## 更新内容

### 1. 数据源更改
- **之前**: 使用 `weather_stations.csv` 文件
- **现在**: 使用 `weather_station_info.json` 文件

### 2. 新增字段
天气站数据现在包含以下新字段：
- `population`: 人口数量
- `nearestFireStation`: 最近的消防站
- `nearestHospital`: 最近的医院  
- `highwayEscape`: 高速公路逃生路线

### 3. API集成
- 添加了 OpenWeatherMap API 集成
- 当本地CSV数据不可用时，自动从API获取实时天气数据
- 支持获取温度、湿度、气压、风速、风向、降水量、能见度等数据

### 4. 配置要求
需要在环境变量中配置API密钥：
```
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

### 5. 代码更改
- `src/types/weather.ts`: 扩展了WeatherStation接口
- `src/data/weatherStationParser.ts`: 重构了数据解析器，添加API调用
- `src/components/weather/WeatherStationList.tsx`: 更新了组件使用新数据源
- `src/components/maps/MapContainer.tsx`: 更新了地图组件

### 6. 兼容性
- 保持了向后兼容性
- 现有的`parseWeatherStationsFromCSV()`函数仍然可用，但内部使用JSON数据源
- 组件接口保持不变

### 7. 缺失数据处理
对于`weather_station_info.json`中标记为"TBD"的字段，系统会：
1. 首先尝试从本地CSV获取天气数据
2. 如果CSV数据不可用，则使用OpenWeatherMap API获取实时数据
3. 显示相应的错误信息或默认值

这样确保了即使某些天气站缺少本地数据，用户仍能看到实时的天气信息。 