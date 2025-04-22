package cn.coderhythm.models;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.Date;

@Entity
@Table(name = "maintenance_companies")
public class MaintenanceCompany {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    @Column(name = "company_name")
    private String companyName;

    @Size(max = 50)
    @Column(name = "company_type")
    private String companyType;

    @Size(max = 100)
    @Column(name = "legal_person")
    private String legalPerson;

    @Size(max = 100)
    @Column(name = "contact_person")
    private String contactPerson;

    @Size(max = 20)
    @Column(name = "contact_phone")
    private String contactPhone;

    @Size(max = 500)
    private String address;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    // 默认构造函数
    public MaintenanceCompany() {
    }

    // 带参数的构造函数
    public MaintenanceCompany(String companyName, String companyType, String legalPerson,
                           String contactPerson, String contactPhone, String address) {
        this.companyName = companyName;
        this.companyType = companyType;
        this.legalPerson = legalPerson;
        this.contactPerson = contactPerson;
        this.contactPhone = contactPhone;
        this.address = address;
    }

    // 在保存前自动设置创建时间和更新时间
    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }

    // 在更新前自动设置更新时间
    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyType() {
        return companyType;
    }

    public void setCompanyType(String companyType) {
        this.companyType = companyType;
    }

    public String getLegalPerson() {
        return legalPerson;
    }

    public void setLegalPerson(String legalPerson) {
        this.legalPerson = legalPerson;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
} 