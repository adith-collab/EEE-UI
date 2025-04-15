%% Load Forecasting

%% Import Data
filename = "C:\Users\adith\NOTES\S2\Project\EEE&UI\projecteee\projecteee\EEE&UI\EEE&UI\archive\train_dataframes.xlsx"; % Adjust path
data = csv2struct(filename); % Load data as a structure

% Display the field names to confirm the column names
disp(fieldnames(data));

%% Variables
load = data.DEMAND; % System load values
hr = data.hourOfDay; % Hour of the day
dates = datenum(data.datetime, 'mm-dd-yyyy') + (data.hourOfDay-1)/24;

if all(floor(dates)==dates)
    dates = dates + (data.hourOfDay-1)/24;
end

%% Days
k = 1;
days = zeros(366,1);
for i = 1:24:length(dates)
    days(k) = dates(i);
    k = k+1;
end
dload = zeros(366,1);
l = 1;
for i = 1:24:length(load)
    dload(l) = sum(load(i:i+23));
    l = l+1;
end

%% Seasonal Data
sload = load(3649:4368); % June (summer)
wload = load(1:24*31);   % January (winter)
fload = load(7321:8040); % November (fall)
spload = load(2905:3648); % May (spring)

%% Previous Data
prev_day_sme_hr = [NaN(24,1); data.DEMAND(1:end-24)];
prev_wek_sem_hr = [NaN(168,1); data.DEMAND(1:end-168)];

x = [data.T2M_toc, data.week_X_2, data.week_X_3, data.week_X_4, data.MA_X_4, ...
     data.dayOfWeek, data.weekend, data.holiday, data.Holiday_ID, data.hourOfDay, ...
     prev_day_sme_hr, prev_wek_sem_hr];

labels = {'Temperature', 'Week X-2', 'Week X-3', 'Week X-4', 'MA X-4', 'Day of Week', ...
          'Weekend', 'Holiday', 'Holiday ID', 'Hour of Day', ...
          'Prev day same hour load', 'Prev week same hour load'};

y = load; % Target load values

%% Handle Missing Values
x = fillmissing(x, 'linear'); % Replace NaNs with interpolated values

%% Remove Constant Columns
std_x = std(x); 
constant_cols = std_x == 0; % Identify constant columns
x(:, constant_cols) = []; % Remove constant columns

%% Check and Handle Multicollinearity
corr_matrix = corrcoef(x); 
high_corr_pairs = find(abs(corr_matrix) > 0.98 & abs(corr_matrix) < 1); % Identify highly correlated features
if ~isempty(high_corr_pairs)
    x(:, high_corr_pairs(1)) = []; % Remove one of the correlated columns
end

%% Feature Normalization
x = normalize(x); % Normalize feature values

%% Linear Regression using Matrix Operations (instead of regress)
X = [ones(length(x), 1), x]; % Add a column of ones for the intercept term

% Use Moore-Penrose Pseudoinverse instead of matrix inversion to avoid singularity issues
b = pinv(X' * X) * (X' * y); 

% Predicted values using the regression model
ypred = X * b; 

%% Training and Testing Split (80-20%)
trn = floor(0.8 * length(x));
trnX = x(1:trn, :);
trnY = y(1:trn, :);
trndates = dates(1:trn, :);

testX = x(trn+1:end, :);
testY = y(trn+1:end, :);
testdates = dates(trn+1:end, :);

%% Neural Network Model
net = fitnet(30); % Create a feedforward neural network with 30 hidden neurons
net = train(net, trnX', trnY');

%% Forecast and Error Metrics
load_forecast = net(testX')';

% Calculate error
err = testY - load_forecast;
errp = (abs(err) ./ testY) * 100; % Percentage error

% Compute performance metrics
mae = mean(abs(err)); % Mean Absolute Error
mape = mean(errp);    % Mean Absolute Percentage Error
accuracy = 100 - mape; % Forecasting Accuracy

%% Display Results in Command Window
disp('-------------------------------------');
disp('       Load Forecasting Results      ');
disp('-------------------------------------');
disp(['Mean Absolute Error (MAE): ', num2str(mae)]);
disp(['Mean Absolute Percentage Error (MAPE): ', num2str(mape), '%']);
disp(['Forecasting Accuracy: ', num2str(accuracy), '%']);
disp('-------------------------------------');

%% Compare Forecast Load with Actual Load
h1 = figure;
plotregression(testY', load_forecast, 'Regression Analysis: Test vs Forecast');

%% Figures
h2 = figure;
plot(testY, 'DisplayName', 'Actual Load'); hold on;
plot(load_forecast, 'DisplayName', 'Forecasted Load');
hold off;
ylabel('Load');
legend show;
title('Actual vs Forecasted Load');

h3 = figure;
plot(testdates, testY - load_forecast);
xlabel('Date'); ylabel('Error');
title('Forecast Error Over Time');

%% Save Results as JSON File
forecast_results = struct('ActualLoad', testY, 'ForecastedLoad', load_forecast, 'Error', testY - load_forecast);
json_results = jsonencode(forecast_results);

% Write JSON to a file
output_file = 'C:\PROJECTS\projecteee\EEE&UI\EEE&UI\UI PROJECT\forecast_results.json'; % Adjust path if needed
fid = fopen(output_file, 'w');
fwrite(fid, json_results, 'char');
fclose(fid);

disp('Results saved to forecast_results.json');

%% Function Definitions (Must Be at the End of the Script)
function Out = csv2struct(filename)
    % Read Excel files stored in .xls or .csv file formats and
    % store results as a struct with field names based on the header row.
    [~, ~, raw] = xlsread(filename);
    nRow = size(raw, 1);
    nCol = size(raw, 2);
    header = raw(1, :);   % Store header information
    raw(1, :) = [];       % Remove header from the data

    num = [];
    txt = [];
    ColNumeric = true(1, nCol);
    for c = 1:nCol
        col = raw(:, c);
        for r = 1:nRow-1
            if (~isnumeric(col{r}) || isnan(col{r}))
                ColNumeric(c) = false;
                break;
            end
        end
        if (ColNumeric(c))
            num = [num cell2mat(col)];
        else
            txt = [txt col];
        end
    end

    iNum = 1;
    iTxt = 1;
    for c = 1:nCol
        if ischar(header{c})
            name = strtrim(header{c});
            name(name == ' ') = '_';
            name = matlab.lang.makeValidName(name);
        else
            name = char('A'-1+c);
        end

        if (ColNumeric(c))
            Out.(name) = num(:, iNum);
            iNum = iNum + 1;
        else
            Out.(name) = txt(:, iTxt);
            iTxt = iTxt + 1;
        end
    end
end