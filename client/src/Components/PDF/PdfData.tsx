import React from 'react';
import { Page, Text, View, Document, Image } from '@react-pdf/renderer';
import dayjs, { Dayjs } from 'dayjs';
import { PdfStyles } from './PdfStyles';
import { DateRangeForecast } from '../../types';

interface PdfDataProps {
    data: DateRangeForecast[];  
    dateRange: [Dayjs, Dayjs];
}

export const PdfData: React.FC<PdfDataProps> = ({ data, dateRange }) => {
    const [startDate, endDate] = dateRange;
    const hasValidData = data.some(dayData =>
        dayData.forecast.some(item => item.Load !== null || item.Actual !== null)
    );
    const hasActualLoad = data.some(dayData =>
        dayData.forecast.some(item => item.Actual !== null && item.Actual !== 0)
    );

   
    const pagesCount = data.length;

    return (
        <Document>
            {data.map((dayData, pageIndex) => (
                <Page key={pageIndex} size="A4" style={PdfStyles.page}>
                    <Image src="/Dagitb-logo.png" style={PdfStyles.logo} />
                    <Text style={PdfStyles.header}>Tourist Arrivals Report</Text>

                    {/* header and date range on the first page if marami pages */}
                    {pageIndex === 0 && pagesCount > 1 && (
                        <>
                            <Text style={PdfStyles.date}>
                                {startDate.format('MM-DD-YYYY')} — {endDate.format('MM-DD-YYYY')}
                            </Text>
                        </>
                    )}

                    <Text style={PdfStyles.date}>{dayjs(dayData.date).format('MM-DD-YYYY')}</Text>

                    <View style={PdfStyles.table}>
                        <View style={PdfStyles.tableHeader}>
                            <Text style={PdfStyles.tableCell}>Date</Text>
                            <Text style={PdfStyles.tableCell}>Forecasted Arrivals</Text>
                            {hasActualLoad && (
                                <Text style={PdfStyles.lastCell}>Actual Arrivals</Text>
                            )}
                        </View>
                        {hasValidData ? (
                            dayData.forecast.map((item, index) => (
                                <View
                                    key={index}
                                    style={[
                                        PdfStyles.tableRow,
                                        index % 2 === 1 ? PdfStyles.alternateRow : {},
                                    ]}
                                >
                                    <Text style={PdfStyles.tableCell}>{item.Datetime || ''}</Text>
                                    <Text style={PdfStyles.tableCell}>
                                        {item.Load !== null ? item.Load.toFixed(0) : ''}
                                    </Text>
                                    {hasActualLoad && (
                                        <Text style={PdfStyles.lastCell}>
                                            {item.Actual !== null ? item.Actual.toFixed(0) : ''}
                                        </Text>
                                    )}
                                </View>
                            ))
                        ) : (
                            <Text style={PdfStyles.noData}>No data available</Text>
                        )}
                    </View>
                </Page>
            ))}
        </Document>
    );
};
