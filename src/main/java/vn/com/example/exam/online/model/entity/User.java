package vn.com.example.exam.online.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;
import lombok.experimental.FieldDefaults;
import vn.com.example.exam.online.model.RoleEnum;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Accessors(chain = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String username;
    String passwordHash;
    String email;
    String firstName;
    String lastName;
    String image;
    OffsetDateTime createAt;
    OffsetDateTime updateAt;
    @Column(name = "two_factor")
    boolean twoFactor;
    @Enumerated(EnumType.STRING)
    RoleEnum role;
    @OneToMany(mappedBy = "teacher")
    List<Class> classes = new ArrayList<>();
    @OneToMany(mappedBy = "creator")
    List<Exam> exams;
    @OneToMany(mappedBy = "user")
    List<LoginHistory> loginHistories;

    public String getRoleName() {
        return this.role.toString();
    }

    @Override
    public String toString() {
        return "User [id=" + id + ", username=" + username + ", passwordHash=" + passwordHash;
    }
}

