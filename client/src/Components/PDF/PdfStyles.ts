import { StyleSheet } from '@react-pdf/renderer';

export const PdfStyles = StyleSheet.create({
    logo: {
        width: 180,
        marginBottom: 10,
        alignSelf: 'center',
    },
    page: {
        padding: 20,
        fontSize: 12,
    },
    header: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    date: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 10,
    },
    table: {
        margin: '20px 0',
        border: '1px solid #000',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #000',
    },
    tableHeader: {
        backgroundColor: '#3B19C2',
        color: 'white',
        flexDirection: 'row',
        borderBottom: '1px solid #000',
    },
    tableCell: {
        width: '50%',
        padding: 5,
        borderRight: '1px solid #000',
    },
    lastCell: {
        width: '50%',
        padding: 5,
        borderRight: '1px solid #000',
    },
    noData: {
        textAlign: 'center',
        padding: 10,
        fontStyle: 'italic',
        color: '#888',
    },
    alternateRow: {
        backgroundColor: '#E6E6FA',
    },
});
